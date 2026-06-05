import "server-only";

import { PREDATOR_RANK_LADDER } from "@/config/predator-platform-pricing";
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
