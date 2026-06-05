import "server-only";

import { applyProcessingFee } from "@/lib/checkout/processing-fee";
import type { CheckoutQuote, CheckoutQuoteAdjustment } from "@/types/checkout";

export function finalizeFromServiceCents(
  partial: Omit<
    CheckoutQuote,
    "amountCents" | "serviceCents" | "processingFeeCents"
  >,
  serviceCents: number,
  baseAdjustments: CheckoutQuoteAdjustment[] = []
): CheckoutQuote {
  const { processingFeeCents, totalCents } = applyProcessingFee(serviceCents);

  return {
    ...partial,
    serviceCents,
    processingFeeCents,
    amountCents: totalCents,
    adjustments: [
      ...baseAdjustments,
      { label: "Processing fee (4%)", cents: processingFeeCents },
    ],
  };
}
