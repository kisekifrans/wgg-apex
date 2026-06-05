import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { FeaturedPromo, PromoCode } from "@/types/promo";

type PromoRow = {
  id: string;
  code: string;
  description: string | null;
  discount_cents: number;
  service_slug: string | null;
  is_featured: boolean;
  max_redemptions: number | null;
  redemption_count: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapPromo(row: PromoRow): PromoCode {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    discountCents: row.discount_cents,
    serviceSlug: row.service_slug,
    isFeatured: row.is_featured,
    maxRedemptions: row.max_redemptions,
    redemptionCount: row.redemption_count,
    isActive: row.is_active,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAdminPromoCodes(): Promise<PromoCode[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as PromoRow[]).map(mapPromo);
}

export async function getFeaturedPromos(): Promise<FeaturedPromo[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("code, description, discount_cents, service_slug")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false });

  if (error) return [];

  return (data ?? []).map((row) => ({
    code: row.code as string,
    description: row.description as string | null,
    discountCents: row.discount_cents as number,
    serviceSlug: row.service_slug as string | null,
  }));
}

export type ValidatePromoResult =
  | {
      success: true;
      promoCodeId: string;
      code: string;
      discountCents: number;
      description: string | null;
    }
  | { success: false; error: string };

export async function validatePromoCode(opts: {
  code: string;
  serviceSlug: string | null;
  serviceCents: number;
}): Promise<ValidatePromoResult> {
  const normalized = opts.code.trim().toUpperCase();
  if (!normalized) {
    return { success: false, error: "Enter a promo code" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data) {
    return { success: false, error: "Invalid promo code" };
  }

  const promo = mapPromo(data as PromoRow);
  const now = Date.now();

  if (!promo.isActive) {
    return { success: false, error: "This promo code is no longer active" };
  }

  if (promo.startsAt && new Date(promo.startsAt).getTime() > now) {
    return { success: false, error: "This promo code is not active yet" };
  }

  if (promo.endsAt && new Date(promo.endsAt).getTime() < now) {
    return { success: false, error: "This promo code has expired" };
  }

  if (
    promo.maxRedemptions != null &&
    promo.redemptionCount >= promo.maxRedemptions
  ) {
    return { success: false, error: "This promo code has reached its usage limit" };
  }

  if (promo.serviceSlug && opts.serviceSlug !== promo.serviceSlug) {
    return { success: false, error: "This promo code does not apply to this service" };
  }

  if (promo.discountCents >= opts.serviceCents) {
    return {
      success: false,
      error: "Promo discount cannot exceed the service price",
    };
  }

  return {
    success: true,
    promoCodeId: promo.id,
    code: promo.code,
    discountCents: promo.discountCents,
    description: promo.description,
  };
}

export async function recordPromoRedemption(opts: {
  promoCodeId: string;
  checkoutId: string;
  orderId: string;
  discountCents: number;
}): Promise<void> {
  const supabase = createAdminClient();

  const { error: redemptionError } = await supabase
    .from("promo_code_redemptions")
    .insert({
      promo_code_id: opts.promoCodeId,
      checkout_id: opts.checkoutId,
      order_id: opts.orderId,
      discount_cents: opts.discountCents,
    });

  if (redemptionError) {
    throw new Error(redemptionError.message);
  }

  const { data: promo, error: fetchError } = await supabase
    .from("promo_codes")
    .select("redemption_count")
    .eq("id", opts.promoCodeId)
    .single();

  if (fetchError || !promo) {
    throw new Error(fetchError?.message ?? "Promo code not found");
  }

  const { error: updateError } = await supabase
    .from("promo_codes")
    .update({
      redemption_count: (promo.redemption_count as number) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", opts.promoCodeId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}
