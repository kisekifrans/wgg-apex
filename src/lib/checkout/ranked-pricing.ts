import { ORDER_RANK_OPTIONS } from "@/config/orders";
import {
  getPlatformLabel,
  getPriorityLabel,
  getPriorityMultiplier,
  type CheckoutPlatform,
  type CheckoutPriority,
} from "@/config/checkout-options";
import type { CatalogPricingItem } from "@/types/services";

export type QuoteAdjustment = {
  label: string;
  cents: number;
};

export function isRankedTierCheckout(slug: string | null): boolean {
  return slug === "ranked-boosting" || slug === "self-play-boosting";
}

export function parseCheckoutPlatform(
  value: string | null | undefined
): CheckoutPlatform | null {
  const v = value?.trim();
  if (v === "pc" || v === "playstation" || v === "xbox" || v === "switch") {
    return v;
  }
  return null;
}

export function parseCheckoutPriority(
  value: string | null | undefined
): CheckoutPriority {
  return value?.trim() === "express" ? "express" : "standard";
}

export function applyRankedCheckoutPricing(
  baseCents: number,
  platform: CheckoutPlatform,
  priority: CheckoutPriority
): { amountCents: number; adjustments: QuoteAdjustment[] } {
  const multiplier = getPriorityMultiplier(priority);
  const priorityExtra =
    multiplier > 1 ? Math.round(baseCents * (multiplier - 1)) : 0;
  const amountCents = baseCents + priorityExtra;

  const adjustments: QuoteAdjustment[] = [
    { label: "Base rate", cents: baseCents },
  ];

  if (priorityExtra > 0) {
    adjustments.push({
      label: `${getPriorityLabel(priority)} priority`,
      cents: priorityExtra,
    });
  }

  adjustments.push({
    label: `Platform · ${getPlatformLabel(platform)}`,
    cents: 0,
  });

  return { amountCents, adjustments };
}

export function formatCheckoutOptionsNote(
  platform: CheckoutPlatform,
  priority: CheckoutPriority
): string {
  return `Platform: ${getPlatformLabel(platform)} · Priority: ${getPriorityLabel(priority)}`;
}

function tierGroupForRank(rank: string): string {
  if (rank === "Master" || rank === "Predator") return rank;
  return rank.split(" ")[0] ?? rank;
}

/** Sum per-division step prices from current rank up to target (exclusive of current). */
export function computeRankSpanBaseCents(
  pricingItems: CatalogPricingItem[],
  currentRank: string,
  targetRank: string
): number | null {
  const currentIdx = ORDER_RANK_OPTIONS.indexOf(
    currentRank as (typeof ORDER_RANK_OPTIONS)[number]
  );
  const targetIdx = ORDER_RANK_OPTIONS.indexOf(
    targetRank as (typeof ORDER_RANK_OPTIONS)[number]
  );

  if (currentIdx < 0 || targetIdx < 0 || targetIdx <= currentIdx) {
    return null;
  }

  const priceByTier = new Map(
    pricingItems.filter((i) => i.isActive).map((i) => [i.name, i.priceCents])
  );

  let total = 0;
  for (let i = currentIdx + 1; i <= targetIdx; i++) {
    const rank = ORDER_RANK_OPTIONS[i];
    const tier = tierGroupForRank(rank);
    const tierPrice = priceByTier.get(tier);
    if (tierPrice == null) continue;

    if (tier === "Master" || tier === "Predator") {
      total += tierPrice;
    } else {
      total += Math.round(tierPrice / 4);
    }
  }

  return total > 0 ? total : null;
}
