import "server-only";

import { PREDATOR_RANK_LADDER } from "@/config/predator-platform-pricing";
import {
  computePredatorDerivedPercent,
  getCurrentPredatorRankLabel,
} from "@/lib/orders/predator-rank-progress";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicDataClient } from "@/lib/supabase/public-data";
import type {
  PredatorRankProgress,
  PredatorRankProgressStatus,
} from "@/types/predator";

export type { PredatorRankProgress, PredatorRankProgressStatus };

type Row = {
  id: string;
  order_id: string;
  rank_label: string;
  status: PredatorRankProgressStatus;
  completed_at: string | null;
  sort_order: number;
  notes: string | null;
};

function mapRow(row: Row): PredatorRankProgress {
  return {
    id: row.id,
    orderId: row.order_id,
    rankLabel: row.rank_label,
    status: row.status,
    completedAt: row.completed_at,
    sortOrder: row.sort_order,
    notes: row.notes,
  };
}

export async function getPredatorProgressForOrder(
  orderId: string,
  admin = false
): Promise<PredatorRankProgress[]> {
  const supabase = admin ? createAdminClient() : await getPublicDataClient();
  const { data, error } = await supabase
    .from("predator_rank_progress")
    .select("*")
    .eq("order_id", orderId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data as Row[]) ?? []).map(mapRow);
}

export async function ensurePredatorProgressLadder(
  orderId: string
): Promise<PredatorRankProgress[]> {
  const supabase = createAdminClient();
  const existing = await getPredatorProgressForOrder(orderId, true);
  if (existing.length > 0) return existing;

  const rows = PREDATOR_RANK_LADDER.map((rank, index) => ({
    order_id: orderId,
    rank_label: rank,
    status: index === 0 ? "in_progress" : "pending",
    sort_order: index,
  }));

  const { data, error } = await supabase
    .from("predator_rank_progress")
    .insert(rows)
    .select("*");

  if (error) throw new Error(error.message);
  return ((data as Row[]) ?? []).map(mapRow);
}

/** When custom Predator RP is set, align ladder rows so customers see Predator tier. */
export async function alignPredatorLadderForRp(
  orderId: string,
  rp: number | null
): Promise<void> {
  if (rp == null || rp <= 0) return;

  const supabase = createAdminClient();
  let progress = await getPredatorProgressForOrder(orderId, true);
  if (progress.length === 0) {
    progress = await ensurePredatorProgressLadder(orderId);
  }

  const predatorIdx = PREDATOR_RANK_LADDER.length - 1;
  const now = new Date().toISOString();

  for (const step of progress) {
    const idx = PREDATOR_RANK_LADDER.indexOf(
      step.rankLabel as (typeof PREDATOR_RANK_LADDER)[number]
    );
    if (idx < 0) continue;

    let nextStatus: PredatorRankProgressStatus;
    if (idx < predatorIdx) {
      nextStatus = "completed";
    } else {
      nextStatus = step.status === "completed" ? "completed" : "in_progress";
    }

    if (step.status === nextStatus) continue;

    const { error } = await supabase
      .from("predator_rank_progress")
      .update({
        status: nextStatus,
        completed_at: nextStatus === "completed" ? now : null,
      })
      .eq("id", step.id);

    if (error) throw new Error(error.message);
  }
}

export async function syncPredatorOrderProgress(orderId: string): Promise<void> {
  const supabase = createAdminClient();
  let progress = await getPredatorProgressForOrder(orderId, true);
  if (progress.length === 0) return;

  const { data: order } = await supabase
    .from("service_orders")
    .select("predator_custom_rp")
    .eq("id", orderId)
    .maybeSingle();

  const customRp = order?.predator_custom_rp ?? null;

  if (
    customRp != null &&
    customRp > 0 &&
    getCurrentPredatorRankLabel(progress) !== "Predator"
  ) {
    await alignPredatorLadderForRp(orderId, customRp);
    progress = await getPredatorProgressForOrder(orderId, true);
  }

  const percent = computePredatorDerivedPercent(progress, customRp);

  const { error } = await supabase
    .from("service_orders")
    .update({ progress_percent: percent })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}
