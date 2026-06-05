"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import {
  ensurePredatorProgressLadder,
  type PredatorRankProgressStatus,
} from "@/lib/db/predator-progress";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function initPredatorProgress(
  orderId: string
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await ensurePredatorProgressLadder(orderId);
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to initialize progress",
    };
  }
}

export async function updatePredatorRankStatus(
  progressId: string,
  orderId: string,
  status: PredatorRankProgressStatus
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  const updates: Record<string, unknown> = { status };
  if (status === "completed") {
    updates.completed_at = new Date().toISOString();
  } else {
    updates.completed_at = null;
  }

  const { error } = await supabase
    .from("predator_rank_progress")
    .update(updates)
    .eq("id", progressId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/track-order");
  revalidatePath("/account");
  return { success: true };
}
