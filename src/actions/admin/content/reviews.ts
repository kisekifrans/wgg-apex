"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

const CMS_BUCKET = "cms-assets";

const reviewSchema = z.object({
  customerName: z.string().trim().min(2),
  serviceType: z.string().trim().min(2),
  rating: z.coerce.number().min(1).max(5),
  reviewText: z.string().trim().min(10),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type ActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/content");
}

async function uploadAvatar(
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const supabase = createAdminClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `reviews/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(CMS_BUCKET)
    .upload(path, file, { upsert: false });

  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(CMS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createReview(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = reviewSchema.safeParse({
    customerName: formData.get("customerName"),
    serviceType: formData.get("serviceType"),
    rating: formData.get("rating"),
    reviewText: formData.get("reviewText"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const avatarFile = formData.get("avatar");
  let avatarPath: string | null = null;
  try {
    avatarPath =
      avatarFile instanceof File
        ? await uploadAvatar(avatarFile)
        : null;
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Avatar upload failed",
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customer_reviews")
    .insert({
      customer_name: parsed.data.customerName,
      service_type: parsed.data.serviceType,
      rating: parsed.data.rating,
      review_text: parsed.data.reviewText,
      avatar_path: avatarPath,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidate();
  redirect("/admin/content");
}

export async function updateReview(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = reviewSchema.safeParse({
    customerName: formData.get("customerName"),
    serviceType: formData.get("serviceType"),
    rating: formData.get("rating"),
    reviewText: formData.get("reviewText"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const avatarFile = formData.get("avatar");
  const updates: Record<string, unknown> = {
    customer_name: parsed.data.customerName,
    service_type: parsed.data.serviceType,
    rating: parsed.data.rating,
    review_text: parsed.data.reviewText,
    sort_order: parsed.data.sortOrder,
    is_active: parsed.data.isActive,
  };

  if (avatarFile instanceof File && avatarFile.size > 0) {
    try {
      updates.avatar_path = await uploadAvatar(avatarFile);
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : "Avatar upload failed",
      };
    }
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("customer_reviews")
    .update(updates)
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidate();
  redirect("/admin/content");
}

export async function deleteReview(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("customer_reviews")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidate();
  return { success: true };
}
