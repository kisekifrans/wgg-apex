"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";

const CMS_BUCKET = "cms-assets";

const boostSchema = z.object({
  fromRank: z.string().trim().min(2),
  toRank: z.string().trim().min(2),
  description: z.string().trim().optional(),
  completedAt: z.string().trim().min(8),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

function revalidate() {
  revalidatePath("/");
  revalidatePath("/admin/content");
}

async function uploadScreenshot(file: File): Promise<string> {
  const supabase = createAdminClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `boosts/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(CMS_BUCKET)
    .upload(path, file, { upsert: false });

  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(CMS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createCompletedBoost(
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = boostSchema.safeParse({
    fromRank: formData.get("fromRank"),
    toRank: formData.get("toRank"),
    description: formData.get("description") || undefined,
    completedAt: formData.get("completedAt"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const screenshot = formData.get("screenshot");
  if (!(screenshot instanceof File) || screenshot.size === 0) {
    return { success: false, error: "Screenshot is required" };
  }

  let screenshotPath: string;
  try {
    screenshotPath = await uploadScreenshot(screenshot);
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Upload failed",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("completed_boosts").insert({
    from_rank: parsed.data.fromRank,
    to_rank: parsed.data.toRank,
    description: parsed.data.description || null,
    screenshot_path: screenshotPath,
    completed_at: parsed.data.completedAt,
    sort_order: parsed.data.sortOrder,
    is_active: parsed.data.isActive,
  });

  if (error) return { success: false, error: error.message };
  revalidate();
  redirect("/admin/content");
}

export async function deleteCompletedBoost(id: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("completed_boosts")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidate();
  return { success: true };
}
