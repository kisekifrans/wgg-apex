"use client";

import { useState, useTransition } from "react";
import { Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

import { dismissPendingCheckout } from "@/actions/admin/checkout/dismiss-pending-checkout";
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
  const [activeAction, setActiveAction] = useState<{
    id: string;
    type: "replay" | "dismiss";
  } | null>(null);

  if (checkouts.length === 0) return null;

  function handleReplay(checkoutId: string) {
    setActiveAction({ id: checkoutId, type: "replay" });
    startTransition(async () => {
      const result = await replayCheckoutFulfillment(checkoutId);
      setActiveAction(null);

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

  function handleDismiss(checkoutId: string) {
    setActiveAction({ id: checkoutId, type: "dismiss" });
    startTransition(async () => {
      const result = await dismissPendingCheckout(checkoutId);
      setActiveAction(null);

      if (result.success) {
        toast.success("Checkout dismissed");
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
              PayPal checkouts awaiting fulfillment
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Customer approved on PayPal but no order was created (capture or
              webhook missed). Replay fulfill will capture the payment if still
              approved, then create the order.
            </p>
          </div>

          <ul className="divide-y divide-white/5 rounded-lg border border-white/5 bg-card/40">
            {checkouts.map((checkout) => {
              const isActive = pending && activeAction?.id === checkout.id;
              const isReplaying = isActive && activeAction?.type === "replay";
              const isDismissing = isActive && activeAction?.type === "dismiss";
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
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-white/10"
                      disabled={pending}
                      onClick={() => handleReplay(checkout.id)}
                    >
                      {isReplaying ? (
                        <Loader2
                          className="size-4 animate-spin"
                          data-icon="inline-start"
                        />
                      ) : null}
                      Replay fulfill
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground"
                      disabled={pending}
                      onClick={() => handleDismiss(checkout.id)}
                    >
                      {isDismissing ? (
                        <Loader2
                          className="size-4 animate-spin"
                          data-icon="inline-start"
                        />
                      ) : (
                        <X className="size-4" data-icon="inline-start" />
                      )}
                      Dismiss
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
