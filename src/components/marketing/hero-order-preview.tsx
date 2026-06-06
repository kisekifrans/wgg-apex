"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Award, Clock, Link2, Shield, ShieldCheck, ShoppingBag } from "lucide-react";

import { PredatorTrackerProgress } from "@/components/orders/predator-tracker-progress";
import { RankIcon } from "@/components/shared/rank-icon";
import { Badge } from "@/components/ui/badge";
import { parseRankTierFromLabel } from "@/config/brand-assets";
import { formatHeroServiceDetail } from "@/lib/orders/public-display";
import { formatPriceFromCents } from "@/lib/services/format-price";
import { cn } from "@/lib/utils";
import type {
  HeroDashboardOrder,
  HeroOrderPreviewData,
} from "@/types/public-order";

type HeroOrderPreviewProps = {
  preview: HeroOrderPreviewData;
};

function OrderTypeIcon({ order }: { order: HeroDashboardOrder }) {
  if (order.orderType === "predator_maintenance") {
    const tier =
      parseRankTierFromLabel(order.predatorProgressLabel ?? "") ?? "Predator";
    return (
      <RankIcon tier={tier} size="sm" className="ring-1 ring-primary/30" />
    );
  }

  if (
    (order.orderType === "ranked_boost" ||
      order.orderType === "self_play_boost") &&
    order.currentRank
  ) {
    return <RankIcon tier={order.currentRank} size="sm" />;
  }

  if (order.orderType === "badge_boost") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary/10">
        <Award className="size-3.5 text-primary" aria-hidden />
      </span>
    );
  }

  if (order.orderType === "unban_service") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
        <Shield className="size-3.5 text-muted-foreground" aria-hidden />
      </span>
    );
  }

  if (order.orderType === "relinking_service") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-primary/25 bg-primary/10">
        <Link2 className="size-3.5 text-primary" aria-hidden />
      </span>
    );
  }

  if (order.orderType === "marketplace") {
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
        <ShoppingBag className="size-3.5 text-muted-foreground" aria-hidden />
      </span>
    );
  }

  return (
    <span className="size-6 shrink-0 rounded-md border border-dashed border-white/10" />
  );
}

function OrderRankSpan({ order }: { order: HeroDashboardOrder }) {
  if (order.orderType === "predator_maintenance") {
    const detail = formatHeroServiceDetail(order.serviceDetail);
    return (
      <div className="mt-1 flex items-center gap-2">
        <RankIcon tier="Predator" size="sm" />
        <span className="text-sm font-medium">
          {detail ? `${detail} plan` : "Predator maintenance"}
        </span>
      </div>
    );
  }

  if (order.currentRank && order.targetRank) {
    return (
      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm font-medium">
        <RankIcon tier={order.currentRank} size="sm" />
        <span>{order.currentRank}</span>
        <span className="text-muted-foreground" aria-hidden>
          →
        </span>
        <RankIcon tier={order.targetRank} size="sm" />
        <span>{order.targetRank}</span>
      </div>
    );
  }

  const detail = formatHeroServiceDetail(order.serviceDetail);
  if (detail) {
    return <p className="mt-1 text-sm font-medium">{detail}</p>;
  }

  return null;
}

function DashboardOrderRow({ order }: { order: HeroDashboardOrder }) {
  const amountLabel = formatPriceFromCents(order.amountCents);
  const isPredatorMaintenance = order.orderType === "predator_maintenance";

  return (
    <li
      className={cn(
        "rounded-xl border px-3 py-3 transition-colors",
        order.active
          ? "border-primary/25 bg-primary/[0.06]"
          : "border-white/5 bg-white/[0.02]"
      )}
    >
      <div className="flex items-start gap-3">
        <OrderTypeIcon order={order} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-muted-foreground">
                {order.orderNumber}
              </p>
              <p className="text-sm font-medium">{order.serviceLabel}</p>
            </div>
            <span
              className={cn(
                "shrink-0 text-xs",
                order.active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {order.statusLabel}
            </span>
          </div>

          <OrderRankSpan order={order} />

          {isPredatorMaintenance ? (
            <PredatorTrackerProgress
              className="mt-2.5"
              progress={order.predatorProgress}
              customRp={order.predatorCustomRp}
              startingRank={order.currentRank}
              variant="compact"
            />
          ) : (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Progress</span>
                <span className="font-mono tabular-nums">
                  {order.progressPercent}%
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${order.progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2 pl-9 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden />
          <span>{order.etaLabel}</span>
        </div>
        {amountLabel ? (
          <span className="font-mono font-semibold tabular-nums text-foreground">
            {amountLabel}
          </span>
        ) : null}
      </div>
    </li>
  );
}

export function HeroOrderPreview({ preview }: HeroOrderPreviewProps) {
  const prefersReducedMotion = useReducedMotion();

  const content = (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[rgba(249,115,22,0.12)] blur-3xl"
        aria-hidden
      />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Platform dashboard
              {preview.isLive ? (
                <span className="ml-2 text-primary">Live</span>
              ) : null}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {preview.orders.length} active orders
            </p>
          </div>
          <Badge
            variant="outline"
            className="gap-1 border-primary/30 bg-primary/10 text-primary"
          >
            <ShieldCheck className="size-3" aria-hidden />
            Verified
          </Badge>
        </div>

        <ul className="scrollbar-wgg max-h-[min(28rem,58vh)] space-y-2 overflow-y-auto pr-1">
          {preview.orders.map((order) => (
            <DashboardOrderRow key={order.orderNumber} order={order} />
          ))}
        </ul>

        <p className="text-center text-xs text-muted-foreground">
          <Link href="/track-order" className="text-primary hover:underline">
            Track your order
          </Link>
        </p>
      </div>
    </div>
  );

  if (prefersReducedMotion) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        delay: 0.2,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
    >
      {content}
    </motion.div>
  );
}
