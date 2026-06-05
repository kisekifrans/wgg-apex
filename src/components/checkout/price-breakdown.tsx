import { PROCESSING_FEE_LABEL } from "@/lib/checkout/processing-fee";
import { formatPriceFromCents } from "@/lib/services/format-price";
import type { CheckoutQuote } from "@/types/checkout";

type PriceBreakdownProps = {
  quote: CheckoutQuote | null;
  loading?: boolean;
};

export function PriceBreakdown({ quote, loading }: PriceBreakdownProps) {
  if (!quote) {
    if (loading) {
      return (
        <p className="text-sm text-muted-foreground">Calculating price…</p>
      );
    }
    return null;
  }

  return (
    <div className="space-y-2 border-t border-white/5 pt-3 text-sm">
      {(quote.adjustments ?? [])
        .filter((a) => a.cents !== 0 && !a.label.includes("Processing fee"))
        .map((adjustment) => (
          <div key={adjustment.label} className="flex justify-between gap-2">
            <span className="text-muted-foreground">{adjustment.label}</span>
            <span
              className={`font-mono tabular-nums ${
                adjustment.cents < 0 ? "text-primary" : ""
              }`}
            >
              {adjustment.cents < 0 ? "−" : ""}
              {formatPriceFromCents(Math.abs(adjustment.cents))}
            </span>
          </div>
        ))}
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">Service subtotal</span>
        <span className="font-mono tabular-nums">
          {formatPriceFromCents(quote.serviceCents)}
        </span>
      </div>
      <div className="flex justify-between gap-2">
        <span className="text-muted-foreground">Processing fee (4%)</span>
        <span className="font-mono tabular-nums">
          {formatPriceFromCents(quote.processingFeeCents)}
        </span>
      </div>
      <div className="flex justify-between gap-2 border-t border-white/5 pt-2 font-medium">
        <span>Total</span>
        <span className="font-mono text-lg tabular-nums">
          {formatPriceFromCents(quote.amountCents)}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{PROCESSING_FEE_LABEL}</p>
    </div>
  );
}
