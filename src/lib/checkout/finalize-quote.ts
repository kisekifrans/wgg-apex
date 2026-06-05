import "server-only";

import { applyProcessingFee } from "@/lib/checkout/processing-fee";
import type { CheckoutQuote, CheckoutQuoteAdjustment } from "@/types/checkout";

export function finalizeFromServiceCents(
  partial: Omit<
    CheckoutQuote,
    "amountCents" | "serviceCents" | "processingFeeCents"
  >,
  serviceCents: number,
  baseAdjustments: CheckoutQuoteAdjustment[] = [],
  promo?: {
    discountCents: number;
    promoCode: string;
    promoCodeId: string;
  } | null
): CheckoutQuote {
  const discountCents = promo?.discountCents ?? 0;
  const netServiceCents = Math.max(0, serviceCents - discountCents);
  const { processingFeeCents, totalCents } = applyProcessingFee(netServiceCents);

  const adjustments = [...baseAdjustments];
  if (discountCents > 0 && promo) {
    adjustments.push({
      label: `Promo (${promo.promoCode})`,
      cents: -discountCents,
    });
  }
  adjustments.push({ label: "Processing fee (4%)", cents: processingFeeCents });

  return {
    ...partial,
    serviceCents: netServiceCents,
    processingFeeCents,
    amountCents: totalCents,
    discountCents: discountCents > 0 ? discountCents : undefined,
    promoCode: promo?.promoCode ?? null,
    promoCodeId: promo?.promoCodeId ?? null,
    adjustments,
  };
}
