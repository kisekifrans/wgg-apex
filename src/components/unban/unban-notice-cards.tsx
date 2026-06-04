import Link from "next/link";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";

import { unbanServiceNotices } from "@/config/unban-service";

const icons = {
  success: TrendingUp,
  time: Clock,
  policy: AlertTriangle,
} as const;

export function UnbanNoticeCards() {
  const items = [
    {
      key: "success" as const,
      ...unbanServiceNotices.successRate,
      icon: icons.success,
      accent: "border-primary/25 bg-primary/5",
      valueClass: "text-primary",
    },
    {
      key: "time" as const,
      ...unbanServiceNotices.processingTime,
      icon: icons.time,
      accent: "border-white/10 bg-white/[0.02]",
      valueClass: "text-foreground",
    },
    {
      key: "policy" as const,
      ...unbanServiceNotices.refundPolicy,
      icon: icons.policy,
      accent: "border-amber-500/20 bg-amber-500/5",
      valueClass: "text-amber-200/90",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        const showValue = "value" in item && item.value;

        return (
          <article
            key={item.key}
            className={`rounded-xl border p-5 ${item.accent}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-2">
                <Icon className="size-4 text-primary" aria-hidden />
              </div>
              {showValue && (
                <p
                  className={`font-mono text-2xl font-semibold tabular-nums ${item.valueClass}`}
                >
                  {item.value}
                </p>
              )}
            </div>
            <h3 className="mt-4 text-sm font-semibold tracking-tight">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            {"footnote" in item && item.footnote && (
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/80">
                {item.footnote}
              </p>
            )}
            {item.key === "policy" && (
              <Link
                href={unbanServiceNotices.refundPolicy.linkHref}
                className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
              >
                {unbanServiceNotices.refundPolicy.linkLabel}
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
