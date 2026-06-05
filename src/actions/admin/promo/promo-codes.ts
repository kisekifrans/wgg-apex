"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

export type PromoActionResult =
  | { success: true }
  | { success: false; error: string };

function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export async function createPromoCode(
  formData: FormData
): Promise<PromoActionResult> {
  await requireAdmin();

  const code = normalizeCode(String(formData.get("code") ?? ""));
  const description = String(formData.get("description") ?? "").trim() || null;
  const discountDollars = Number(formData.get("discountDollars") ?? 0);
  const serviceSlug =
    String(formData.get("serviceSlug") ?? "").trim() || null;
  const isFeatured = formData.get("isFeatured") === "on";
  const maxRedemptionsRaw = String(formData.get("maxRedemptions") ?? "").trim();
  const maxRedemptions = maxRedemptionsRaw
    ? Number.parseInt(maxRedemptionsRaw, 10)
    : null;

  if (!code || code.length < 3) {
    return { success: false, error: "Promo code must be at least 3 characters" };
  }

  if (!Number.isFinite(discountDollars) || discountDollars <= 0) {
    return { success: false, error: "Enter a valid discount amount" };
  }

  const discountCents = Math.round(discountDollars * 100);

  const supabase = createAdminClient();
  const { error } = await supabase.from("promo_codes").insert({
    code,
    description,
    discount_cents: discountCents,
    service_slug: serviceSlug,
    is_featured: isFeatured,
    max_redemptions: maxRedemptions,
    is_active: true,
  });

  if (error) {
    return {
      success: false,
      error: error.code === "23505" ? "That promo code already exists" : error.message,
    };
  }

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true };
}

export async function setPromoCodeActive(
  promoId: string,
  isActive: boolean
): Promise<PromoActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("promo_codes")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", promoId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true };
}

export async function deletePromoCode(promoId: string): Promise<PromoActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase.from("promo_codes").delete().eq("id", promoId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/content");
  revalidatePath("/");
  return { success: true };
}
