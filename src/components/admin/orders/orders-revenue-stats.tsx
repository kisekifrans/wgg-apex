import {
  CircleDollarSign,
  Clock,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { formatOrderAmount } from "@/lib/orders/format";
import type { ServiceOrderRevenueMetrics } from "@/types/orders";
import { cn } from "@/lib/utils";

type OrdersRevenueStatsProps = {
  metrics: ServiceOrderRevenueMetrics;
  filteredPaidCents: number;
  filteredCount: number;
  hasActiveFilters: boolean;
};

const cards = [
  {
    key: "total",
    label: "Total revenue",
    sub: "Paid orders (all time)",
    icon: Wallet,
    accent: "from-primary/20 to-transparent",
    iconClass: "text-primary",
  },
  {
    key: "today",
    label: "Revenue today",
    sub: "Paid · updated today",
    icon: TrendingUp,
    accent: "from-emerald-500/15 to-transparent",
    iconClass: "text-emerald-400",
  },
  {
    key: "pipeline",
    label: "Pipeline",
    sub: "Quoted · payment pending",
    icon: Clock,
    accent: "from-amber-500/15 to-transparent",
    iconClass: "text-amber-400",
  },
  {
    key: "active",
    label: "In progress value",
    sub: "Paid orders being fulfilled",
    icon: CircleDollarSign,
    accent: "from-sky-500/15 to-transparent",
    iconClass: "text-sky-400",
  },
] as const;

export function OrdersRevenueStats({
  metrics,
  filteredPaidCents,
  filteredCount,
  hasActiveFilters,
}: OrdersRevenueStatsProps) {
  const values: Record<(typeof cards)[number]["key"], string> = {
    total: formatOrderAmount(metrics.totalPaidCents),
    today: formatOrderAmount(metrics.todayPaidCents),
    pipeline: formatOrderAmount(metrics.pipelineCents),
    active: formatOrderAmount(metrics.inProgressValueCents),
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className={cn(
                "relative overflow-hidden rounded-xl border border-white/5 bg-card/50 p-4",
                "bg-gradient-to-br",
                card.accent
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight">
                    {values[card.key]}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/5 p-2">
                  <Icon className={cn("size-4", card.iconClass)} aria-hidden />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">Filtered view:</span>
          <span className="font-medium text-foreground">
            {filteredCount} order{filteredCount === 1 ? "" : "s"}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="font-mono font-medium text-primary">
            {formatOrderAmount(filteredPaidCents)} paid revenue
          </span>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {metrics.activeOrders} active · {metrics.totalOrders} total orders in
        system
      </p>
    </div>
  );
}
