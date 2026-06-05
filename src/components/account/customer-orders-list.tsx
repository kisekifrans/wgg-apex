import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

import { RankIcon } from "@/components/shared/rank-icon";
import { formatPriceFromCents } from "@/lib/services/format-price";
import type { PublicOrderSnapshot } from "@/types/public-order";

type CustomerOrdersListProps = {
  orders: PublicOrderSnapshot[];
};

export function CustomerOrdersList({ orders }: CustomerOrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-card/40 p-8 text-center">
        <Package className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-4 font-medium">No orders yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Orders paid with this email will show up here automatically.
        </p>
        <Link
          href="/#services"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Browse services
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {orders.map((order) => {
        const amount = formatPriceFromCents(order.amountCents);
        const hasRanks = Boolean(order.currentRank && order.targetRank);

        return (
          <li key={order.orderNumber}>
            <Link
              href={`/account/orders/${encodeURIComponent(order.orderNumber)}`}
              className="group flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-card/40 p-5 transition-colors hover:border-primary/25 hover:bg-card/60"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold text-primary">
                  {order.orderNumber}
                </p>
                <p className="mt-1 text-sm font-medium">{order.serviceLabel}</p>
                {hasRanks ? (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <RankIcon tier={order.currentRank!} size="sm" />
                    {order.currentRank} → {order.targetRank}
                  </p>
                ) : order.serviceDetail ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {order.serviceDetail}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {order.statusLabel}
                </span>
                {amount ? (
                  <span className="font-mono text-sm tabular-nums text-muted-foreground">
                    {amount}
                  </span>
                ) : null}
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
