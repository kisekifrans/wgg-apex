"use client";

import { useState, useTransition } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { replayCheckoutFulfillment } from "@/actions/admin/checkout/replay-fulfillment";
import { Button } from "@/components/ui/button";
import { formatPriceFromCents } from "@/lib/services/format-price";
import type { PendingPayPalCheckout } from "@/lib/db/checkout";

type PendingCheckoutsPanelProps = {
  checkouts: PendingPayPalCheckout[];
};

export function PendingCheckoutsPanel({
  checkouts,
}: PendingCheckoutsPanelProps) {
  const [pending, startTransition] = useTransition();
  const [activeId, setActiveId] = useState<string | null>(null);

  if (checkouts.length === 0) return null;

  function handleReplay(checkoutId: string) {
    setActiveId(checkoutId);
    startTransition(async () => {
      const result = await replayCheckoutFulfillment(checkoutId);
      setActiveId(null);

      if (result.success) {
        toast.success(
          result.orderNumber
            ? `Order ${result.orderNumber} created`
            : "Checkout fulfilled"
        );
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <section className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-5">
      <div className="flex items-start gap-3">
        <RefreshCw className="mt-0.5 size-4 shrink-0 text-amber-400" />
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h2 className="font-heading text-sm font-semibold">
              Paid checkouts awaiting fulfillment
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              PayPal orders that paid but did not create an order (usually a
              missed webhook). Replay fulfillment after confirming payment in
              PayPal.
            </p>
          </div>

          <ul className="divide-y divide-white/5 rounded-lg border border-white/5 bg-card/40">
            {checkouts.map((checkout) => {
              const isLoading = pending && activeId === checkout.id;
              return (
                <li
                  key={checkout.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {checkout.lineItemName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {checkout.customerDiscord}
                      {checkout.customerEmail
                        ? ` · ${checkout.customerEmail}`
                        : ""}
                      {" · "}
                      {formatPriceFromCents(checkout.amountCents)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/10"
                    disabled={pending}
                    onClick={() => handleReplay(checkout.id)}
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                    ) : null}
                    Replay fulfill
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
