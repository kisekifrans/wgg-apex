export const PROCESSING_FEE_RATE = 0.04;

export const PROCESSING_FEE_LABEL =
  "Processing fee (4%) — covers payment processor and transaction costs.";

export function computeProcessingFeeCents(serviceCents: number): number {
  return Math.round(serviceCents * PROCESSING_FEE_RATE);
}

export function applyProcessingFee(serviceCents: number): {
  serviceCents: number;
  processingFeeCents: number;
  totalCents: number;
} {
  const processingFeeCents = computeProcessingFeeCents(serviceCents);
  return {
    serviceCents,
    processingFeeCents,
    totalCents: serviceCents + processingFeeCents,
  };
}
