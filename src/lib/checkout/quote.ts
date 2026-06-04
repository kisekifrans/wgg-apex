import "server-only";

import { slugToCheckoutKind } from "@/config/checkout";
import { getPublicMarketplaceListingById } from "@/lib/db/marketplace-listings";
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
  }

  let serviceDetail: string | null = item.name;
  if (item.subtitle) {
    serviceDetail = `${item.name} · ${item.subtitle}`;
  }

  const descriptionParts: string[] = [];
  if (input.currentRank) descriptionParts.push(`From ${input.currentRank}`);
  if (input.targetRank) descriptionParts.push(`To ${input.targetRank}`);

  return {
    success: true,
    quote: {
      amountCents: item.priceCents,
      currency: item.currency,
      lineItemName: `${service.name} — ${item.name}`,
      lineItemDescription: descriptionParts.join(" · ") || undefined,
      serviceSlug,
      checkoutKind,
      pricingItemId: item.id,
      marketplaceListingId: null,
      serviceDetail,
    },
  };
}

async function buildMarketplaceQuote(
  listingId: string,
  input: CheckoutFormInput
): Promise<QuoteResult> {
  const listing = await getPublicMarketplaceListingById(listingId);

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
