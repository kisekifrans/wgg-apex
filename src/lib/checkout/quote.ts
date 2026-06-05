import "server-only";

import { slugToCheckoutKind } from "@/config/checkout";
import {
  applyRankedCheckoutPricing,
  computeRankSpanBaseCents,
  formatCheckoutOptionsNote,
  isRankedTierCheckout,
  parseCheckoutPlatform,
  parseCheckoutPriority,
} from "@/lib/checkout/ranked-pricing";
import { getPublicMarketplaceListingByRef } from "@/lib/db/marketplace-listings";
import { getServiceBySlug } from "@/lib/db/services-catalog";
import type { CheckoutFormInput, CheckoutQuote } from "@/types/checkout";

export type QuoteResult =
  | { success: true; quote: CheckoutQuote }
  | { success: false; error: string };

export async function buildCheckoutQuote(
  serviceSlug: string | null,
  input: CheckoutFormInput
): Promise<QuoteResult> {
  if (input.listingId) {
    return buildMarketplaceQuote(input.listingId, input);
  }

  if (!serviceSlug) {
    return { success: false, error: "Service not specified" };
  }

  const checkoutKind = slugToCheckoutKind(serviceSlug);
  if (!checkoutKind) {
    return { success: false, error: "Unknown service" };
  }

  const service = await getServiceBySlug(serviceSlug, true);
  if (!service) {
    return { success: false, error: "Service is not available" };
  }

  const rankedTierCheckout = isRankedTierCheckout(serviceSlug);

  if (rankedTierCheckout && service.pricingEngine === "tier_table") {
    const currentRank = input.currentRank?.trim();
    const targetRank = input.targetRank?.trim();
    if (!currentRank || !targetRank) {
      return {
        success: false,
        error: "Current rank and target rank are required",
      };
    }

    const platform = parseCheckoutPlatform(input.platform);
    if (!platform) {
      return { success: false, error: "Please select your platform" };
    }

    const baseCents = computeRankSpanBaseCents(
      service.pricingItems,
      currentRank,
      targetRank
    );
    if (baseCents == null) {
      return {
        success: false,
        error: "Target rank must be above your current rank",
      };
    }

    const priority = parseCheckoutPriority(input.priority);
    const priced = applyRankedCheckoutPricing(baseCents, platform, priority);
    const descriptionParts = [
      `From ${currentRank}`,
      `To ${targetRank}`,
      formatCheckoutOptionsNote(platform, priority),
    ];

    return {
      success: true,
      quote: {
        amountCents: priced.amountCents,
        currency: service.pricingItems[0]?.currency ?? "USD",
        lineItemName: `${service.name} — ${currentRank} → ${targetRank}`,
        lineItemDescription: descriptionParts.join(" · "),
        serviceSlug,
        checkoutKind,
        pricingItemId: null,
        marketplaceListingId: null,
        serviceDetail: `${currentRank} → ${targetRank}`,
        adjustments: priced.adjustments,
      },
    };
  }

  if (!input.pricingItemId) {
    return { success: false, error: "Please select a pricing option" };
  }

  const item = service.pricingItems.find((i) => i.id === input.pricingItemId);
  if (!item || !item.isActive) {
    return { success: false, error: "Invalid pricing selection" };
  }

  if (checkoutKind === "ranked_boost" || checkoutKind === "self_play_boost") {
    if (!input.currentRank?.trim() || !input.targetRank?.trim()) {
      return {
        success: false,
        error: "Current rank and target rank are required",
      };
    }

    const platform = parseCheckoutPlatform(input.platform);
    if (!platform) {
      return { success: false, error: "Please select your platform" };
    }
  }

  let serviceDetail: string | null = item.name;
  if (item.subtitle) {
    serviceDetail = `${item.name} · ${item.subtitle}`;
  }

  const descriptionParts: string[] = [];
  if (input.currentRank) descriptionParts.push(`From ${input.currentRank}`);
  if (input.targetRank) descriptionParts.push(`To ${input.targetRank}`);

  let amountCents = item.priceCents;
  let adjustments: CheckoutQuote["adjustments"];

  if (rankedTierCheckout) {
    const platform = parseCheckoutPlatform(input.platform)!;
    const priority = parseCheckoutPriority(input.priority);
    const priced = applyRankedCheckoutPricing(
      item.priceCents,
      platform,
      priority
    );
    amountCents = priced.amountCents;
    adjustments = priced.adjustments;
    descriptionParts.push(formatCheckoutOptionsNote(platform, priority));
  }

  return {
    success: true,
    quote: {
      amountCents,
      currency: item.currency,
      lineItemName: `${service.name} — ${item.name}`,
      lineItemDescription: descriptionParts.join(" · ") || undefined,
      serviceSlug,
      checkoutKind,
      pricingItemId: item.id,
      marketplaceListingId: null,
      serviceDetail,
      adjustments,
    },
  };
}

async function buildMarketplaceQuote(
  listingRef: string,
  input: CheckoutFormInput
): Promise<QuoteResult> {
  const listing = await getPublicMarketplaceListingByRef(listingRef);

  if (!listing) {
    return { success: false, error: "Listing not found or no longer available" };
  }

  if (listing.status !== "available") {
    return { success: false, error: "This listing is not available for purchase" };
  }

  if (!input.customerDiscord?.trim()) {
    return { success: false, error: "Discord handle is required" };
  }

  return {
    success: true,
    quote: {
      amountCents: listing.priceCents,
      currency: listing.currency,
      lineItemName: `Account — ${listing.title}`,
      lineItemDescription: `${listing.rankLabel} · ${listing.platform}`,
      serviceSlug: "account-marketplace",
      checkoutKind: "marketplace",
      pricingItemId: null,
      marketplaceListingId: listing.id,
      serviceDetail: listing.listingNumber,
    },
  };
}
