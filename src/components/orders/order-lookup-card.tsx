import { CheckCircle2, Clock, Package } from "lucide-react";

import { RankIcon } from "@/components/shared/rank-icon";
import { formatPriceFromCents } from "@/lib/services/format-price";
import type { PublicOrderSnapshot } from "@/types/public-order";

type OrderLookupCardProps = {
  order: PublicOrderSnapshot;
};

export function OrderLookupCard({ order }: OrderLookupCardProps) {
  const amount = formatPriceFromCents(order.amountCents);
  const hasRankSpan = Boolean(order.currentRank && order.targetRank);

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Order found
          </p>
          <p className="font-mono text-lg font-semibold text-primary">
            {order.orderNumber}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
          {order.status === "completed" ? (
            <CheckCircle2 className="size-4" aria-hidden />
          ) : (
            <Package className="size-4" aria-hidden />
          )}
          {order.statusLabel}
        </div>
      </div>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Service</dt>
          <dd className="mt-1 font-medium">{order.serviceLabel}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Payment</dt>
          <dd className="mt-1 font-medium">{order.paymentLabel}</dd>
        </div>
        {hasRankSpan ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Rank span</dt>
            <dd className="mt-2 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <RankIcon tier={order.currentRank!} size="sm" />
                <span className="font-medium">{order.currentRank}</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-1.5">
                <RankIcon tier={order.targetRank!} size="sm" />
                <span className="font-medium">{order.targetRank}</span>
              </div>
            </dd>
          </div>
        ) : order.serviceDetail ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Details</dt>
            <dd className="mt-1 text-sm text-muted-foreground">
              {order.serviceDetail}
            </dd>
          </div>
        ) : null}
        {amount ? (
          <div>
            <dt className="text-xs text-muted-foreground">Amount</dt>
            <dd className="mt-1 font-mono font-semibold tabular-nums">{amount}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs text-muted-foreground">ETA</dt>
          <dd className="mt-1 flex items-center gap-1.5 text-sm">
            <Clock className="size-4 text-muted-foreground" aria-hidden />
            {order.etaLabel}
          </dd>
        </div>
      </dl>

      <div className="mt-8 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-mono tabular-nums">{order.progressPercent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${order.progressPercent}%` }}
          />
        </div>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
        Operators reach out on Discord for fulfillment. If you need help, email{" "}
        <a
          href="mailto:support@wggapex.com"
          className="font-medium text-primary hover:underline"
        >
          support@wggapex.com
        </a>{" "}
        with your order number.
      </p>
    </div>
  );
}
