import "server-only";

import { slugToCheckoutKind } from "@/config/checkout";
import {
  computeKillsFarmingCents,
  formatKillCountLabel,
  getKillsFarmingConfig,
  parseKillCountInput,
} from "@/config/kills-farming-pricing";
import {
  computePredatorPlanPriceCents,
  parsePredatorPlatformPricing,
} from "@/config/predator-platform-pricing";
import {
  applyRankedCheckoutPricing,
  computeRankSpanBaseCents,
  formatCheckoutOptionsNote,
  isRankedTierCheckout,
  parseCheckoutPlatform,
  parseCheckoutPriority,
} from "@/lib/checkout/ranked-pricing";
import { finalizeFromServiceCents } from "@/lib/checkout/finalize-quote";
import { formatPriceFromCents } from "@/lib/services/format-price";
import { getPublicMarketplaceListingByRef } from "@/lib/db/marketplace-listings";
import { validatePromoCode } from "@/lib/db/promo-codes";
import { getServiceBySlug } from "@/lib/db/services-catalog";
import type { CheckoutFormInput, CheckoutQuote } from "@/types/checkout";

export type QuoteResult =
  | { success: true; quote: CheckoutQuote }
  | { success: false; error: string };

type QuotePartial = Omit<
  CheckoutQuote,
  "amountCents" | "serviceCents" | "processingFeeCents"
>;

async function buildFinalQuote(
  partial: QuotePartial,
  grossServiceCents: number,
  baseAdjustments: CheckoutQuote["adjustments"],
  serviceSlug: string | null,
  input: CheckoutFormInput
): Promise<QuoteResult> {
  let promo: {
    discountCents: number;
    promoCode: string;
    promoCodeId: string;
  } | null = null;

  if (input.promoCode?.trim()) {
    const promoResult = await validatePromoCode({
      code: input.promoCode,
      serviceSlug,
      serviceCents: grossServiceCents,
    });

    if (!promoResult.success) {
      return promoResult;
    }

    promo = {
      discountCents: promoResult.discountCents,
      promoCode: promoResult.code,
      promoCodeId: promoResult.promoCodeId,
    };
  }

  return {
    success: true,
    quote: finalizeFromServiceCents(
      partial,
      grossServiceCents,
      baseAdjustments ?? [],
      promo
    ),
  };
}

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
      targetRank,
      {
        platform,
        duoBoost: serviceSlug === "self-play-boosting",
      }
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

    return buildFinalQuote(
      {
        currency: service.pricingItems[0]?.currency ?? "USD",
        lineItemName: `${service.name} — ${currentRank} → ${targetRank}`,
        lineItemDescription: descriptionParts.join(" · "),
        serviceSlug,
        checkoutKind,
        pricingItemId: null,
        marketplaceListingId: null,
        serviceDetail: `${currentRank} → ${targetRank}`,
      },
      priced.amountCents,
      [
        { label: "Service price", cents: priced.amountCents },
        ...priced.adjustments.filter((a) => a.cents > 0),
      ],
      serviceSlug,
      input
    );
  }

  if (serviceSlug === "kills-farming") {
    const config = getKillsFarmingConfig(service.pricingItems);
    const rateItem =
      service.pricingItems.find((i) => i.isActive) ?? service.pricingItems[0];
    if (!rateItem) {
      return { success: false, error: "Kills farming is not configured" };
    }

    const parsed = parseKillCountInput(input.killCount, config);
    if ("error" in parsed) {
      return { success: false, error: parsed.error };
    }

    const serviceCents = computeKillsFarmingCents(parsed.kills, config);
    const killLabel = formatKillCountLabel(parsed.kills);
    const per1000Label = formatPriceFromCents(config.centsPer100Kills * 10);

    return buildFinalQuote(
      {
        currency: rateItem.currency,
        lineItemName: `${service.name} — ${killLabel}`,
        lineItemDescription: `${killLabel} · ${per1000Label} per 1,000 kills`,
        serviceSlug,
        checkoutKind,
        pricingItemId: rateItem.id,
        marketplaceListingId: null,
        serviceDetail: killLabel,
      },
      serviceCents,
      [{ label: killLabel, cents: serviceCents }],
      serviceSlug,
      input
    );
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

  let serviceCents = item.priceCents;
  let baseAdjustments: CheckoutQuote["adjustments"] = [
    { label: "Service price", cents: item.priceCents },
  ];

  if (rankedTierCheckout) {
    const platform = parseCheckoutPlatform(input.platform)!;
    const priority = parseCheckoutPriority(input.priority);
    const priced = applyRankedCheckoutPricing(
      item.priceCents,
      platform,
      priority
    );
    serviceCents = priced.amountCents;
    baseAdjustments = [
      { label: "Service price", cents: priced.amountCents },
      ...priced.adjustments.filter((a) => a.cents > 0),
    ];
    descriptionParts.push(formatCheckoutOptionsNote(platform, priority));
  }

  if (serviceSlug === "predator-maintenance") {
    const platform = parseCheckoutPlatform(input.platform) ?? "switch";
    const platformPricing = parsePredatorPlatformPricing(service.displayConfig);
    serviceCents = computePredatorPlanPriceCents(
      item.name,
      platform,
      platformPricing
    );
    baseAdjustments = [
      { label: `${item.name} plan`, cents: serviceCents },
      {
        label: `Platform · ${platform === "switch" ? "Nintendo (Switch)" : platform}`,
        cents: 0,
      },
    ];
    descriptionParts.push(
      `Platform: ${platform === "switch" ? "Nintendo (Switch)" : platform}`
    );
  }

  return buildFinalQuote(
    {
      currency: item.currency,
      lineItemName: `${service.name} — ${item.name}`,
      lineItemDescription: descriptionParts.join(" · ") || undefined,
      serviceSlug,
      checkoutKind,
      pricingItemId: item.id,
      marketplaceListingId: null,
      serviceDetail,
    },
    serviceCents,
    baseAdjustments,
    serviceSlug,
    input
  );
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
    quote: finalizeFromServiceCents(
      {
        currency: listing.currency,
        lineItemName: `Account — ${listing.title}`,
        lineItemDescription: `${listing.rankLabel} · ${listing.platform}`,
        serviceSlug: "account-marketplace",
        checkoutKind: "marketplace",
        pricingItemId: null,
        marketplaceListingId: listing.id,
        serviceDetail: listing.listingNumber,
      },
      listing.priceCents,
      [{ label: "Service price", cents: listing.priceCents }]
    ),
  };
}
