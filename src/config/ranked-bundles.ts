import { parseRankTierFromLabel } from "@/config/brand-assets";
import { ORDER_RANK_OPTIONS } from "@/config/orders";
import type { CatalogPricingItem } from "@/types/services";

export type BundlePricingMetadata = {
  bundle_from?: string;
  bundle_to?: string;
  additional_rank_cents?: number;
  tier?: string;
};

/** Maps each rank index to per-step additional rank cost (cents). */
const TIER_STEP_CENTS: Record<string, number> = {
  Bronze: 300,
  Silver: 400,
  Gold: 500,
  Platinum: 800,
  Diamond: 1400,
  Master: 1400,
  Predator: 1400,
};

function rankTierGroup(rank: string): string {
  if (rank === "Master" || rank === "Predator") return rank;
  return rank.split(" ")[0] ?? rank;
}

function shortTierLabel(tier: string): string {
  if (tier === "Platinum") return "Plat";
  return tier;
}

/** Friendly tier span for homepage table (Bronze → Silver, Gold → Plat, …). */
export function getBundleDisplayRanks(item: CatalogPricingItem): {
  from: string;
  to: string;
  label: string;
} {
  const meta = parseBundleMetadata(item);

  if (meta.bundle_from && meta.bundle_to) {
    const from = rankTierGroup(meta.bundle_from);
    const to = rankTierGroup(meta.bundle_to);
    return {
      from,
      to,
      label: `${shortTierLabel(from)} → ${shortTierLabel(to)}`,
    };
  }

  const parsedFrom = parseRankTierFromLabel(item.name.split("→")[0]?.trim() ?? "");
  const parsedTo = parseRankTierFromLabel(item.name.split("→")[1]?.trim() ?? "");
  const from = parsedFrom ?? item.name;
  const to = parsedTo ?? item.name;

  return {
    from,
    to,
    label: item.name.replace(/Platinum/g, "Plat"),
  };
}

function parseBundleMetadata(item: CatalogPricingItem): BundlePricingMetadata {
  return item.metadata ?? {};
}

export function getBundleAdditionalCents(item: CatalogPricingItem): number | null {
  const meta = parseBundleMetadata(item);
  if (typeof meta.additional_rank_cents === "number") {
    return meta.additional_rank_cents;
  }
  if (meta.tier && TIER_STEP_CENTS[meta.tier] != null) {
    return TIER_STEP_CENTS[meta.tier];
  }
  return null;
}

/** Per-rank step cost for a ladder index using bundle item metadata. */
function stepCentsForRankIndex(
  rankIndex: number,
  items: CatalogPricingItem[]
): number | null {
  const rank = ORDER_RANK_OPTIONS[rankIndex];
  const tier = rankTierGroup(rank);

  for (const item of items) {
    const meta = parseBundleMetadata(item);
    if (meta.tier === tier && meta.additional_rank_cents != null) {
      return meta.additional_rank_cents;
    }
  }

  return TIER_STEP_CENTS[tier] ?? null;
}

/** Sum per-rank steps; use exact package price when span matches a bundle row. */
export function computeBundleSpanCents(
  pricingItems: CatalogPricingItem[],
  currentRank: string,
  targetRank: string
): number | null {
  const activeItems = pricingItems.filter((i) => i.isActive);
  const currentIdx = ORDER_RANK_OPTIONS.indexOf(
    currentRank as (typeof ORDER_RANK_OPTIONS)[number]
  );
  const targetIdx = ORDER_RANK_OPTIONS.indexOf(
    targetRank as (typeof ORDER_RANK_OPTIONS)[number]
  );

  if (currentIdx < 0 || targetIdx < 0 || targetIdx <= currentIdx) {
    return null;
  }

  for (const item of activeItems) {
    const meta = parseBundleMetadata(item);
    if (!meta.bundle_from || !meta.bundle_to) continue;

    const fromIdx = ORDER_RANK_OPTIONS.indexOf(
      meta.bundle_from as (typeof ORDER_RANK_OPTIONS)[number]
    );
    const toIdx = ORDER_RANK_OPTIONS.indexOf(
      meta.bundle_to as (typeof ORDER_RANK_OPTIONS)[number]
    );

    if (fromIdx === currentIdx && toIdx === targetIdx) {
      return item.priceCents;
    }
  }

  let total = 0;
  for (let i = currentIdx + 1; i <= targetIdx; i++) {
    const step = stepCentsForRankIndex(i, activeItems);
    if (step == null) return null;
    total += step;
  }

  return total > 0 ? total : null;
}
