import {
  computeMasterPredatorBaseCents,
  isMasterPredatorSpan,
} from "@/config/master-predator-pricing";
import { computeBundleSpanCents } from "@/config/ranked-bundles";
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

/** Sum bundle per-rank steps from current rank up to target. */
export function computeRankSpanBaseCents(
  pricingItems: CatalogPricingItem[],
  currentRank: string,
  targetRank: string,
  options?: {
    platform?: CheckoutPlatform | null;
    duoBoost?: boolean;
  }
): number | null {
  if (
    isMasterPredatorSpan(currentRank, targetRank) &&
    options?.platform
  ) {
    return computeMasterPredatorBaseCents(
      options.platform,
      options.duoBoost ?? false
    );
  }

  return computeBundleSpanCents(pricingItems, currentRank, targetRank);
}
