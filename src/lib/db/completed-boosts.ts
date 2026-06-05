import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicDataClient } from "@/lib/supabase/public-data";

export type CompletedBoost = {
  id: string;
  fromRank: string;
  toRank: string;
  description: string | null;
  screenshotPath: string;
  completedAt: string;
  sortOrder: number;
  isActive: boolean;
};

type Row = {
  id: string;
  from_rank: string;
  to_rank: string;
  description: string | null;
  screenshot_path: string;
  completed_at: string;
  sort_order: number;
  is_active: boolean;
};

function mapRow(row: Row): CompletedBoost {
  return {
    id: row.id,
    fromRank: row.from_rank,
    toRank: row.to_rank,
    description: row.description,
    screenshotPath: row.screenshot_path,
    completedAt: row.completed_at,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export async function getPublicCompletedBoosts(): Promise<CompletedBoost[]> {
  const supabase = await getPublicDataClient();
  const { data, error } = await supabase
    .from("completed_boosts")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("completed_at", { ascending: false })
    .limit(12);

  if (error) throw new Error(error.message);
  return ((data as Row[]) ?? []).map(mapRow);
}

export async function getAdminCompletedBoosts(): Promise<CompletedBoost[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("completed_boosts")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("completed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data as Row[]) ?? []).map(mapRow);
}

export async function getCompletedBoostById(
  id: string
): Promise<CompletedBoost | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("completed_boosts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as Row) : null;
}
