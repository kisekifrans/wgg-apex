"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, ShieldCheck } from "lucide-react";

import { RankIcon } from "@/components/shared/rank-icon";
import { Badge } from "@/components/ui/badge";

const services = [
  { label: "Ranked boost", status: "In progress", active: true },
  { label: "Predator plan", status: "Scheduled", active: false },
  { label: "Badge order", status: "Completed", active: false },
];

export function HeroOrderPreview() {
  const prefersReducedMotion = useReducedMotion();

  const content = (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-6">
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[rgba(249,115,22,0.12)] blur-3xl"
        aria-hidden
      />
      <div className="relative space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Platform dashboard
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              WGG-2026-00421
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

        <ul className="space-y-2">
          {services.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
            >
              <span className="text-sm font-medium">{item.label}</span>
              <span
                className={
                  item.active
                    ? "text-xs text-primary"
                    : "text-xs text-muted-foreground"
                }
              >
                {item.status}
              </span>
            </li>
          ))}
        </ul>

        <div>
          <p className="text-xs text-muted-foreground">Active order</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <RankIcon tier="Gold" size="sm" />
              <span className="text-lg font-semibold tracking-tight">
                Gold II
              </span>
            </div>
            <span className="text-muted-foreground" aria-hidden>
              →
            </span>
            <div className="flex items-center gap-1.5">
              <RankIcon tier="Diamond" size="sm" />
              <span className="text-lg font-semibold tracking-tight">
                Diamond IV
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-mono tabular-nums">68%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div className="h-full w-[68%] rounded-full bg-primary" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 pt-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" aria-hidden />
            <span>ETA 2 days</span>
          </div>
          <span className="font-mono font-semibold tabular-nums">$149.00</span>
        </div>
      </div>
    </div>
  );

  if (prefersReducedMotion) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
    >
      {content}
    </motion.div>
  );
}
