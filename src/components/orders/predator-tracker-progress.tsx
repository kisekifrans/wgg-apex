import { Check } from "lucide-react";

import { PredatorProgressDisplay } from "@/components/orders/predator-progress-display";
import { RankIcon } from "@/components/shared/rank-icon";
import { PREDATOR_RANK_LADDER } from "@/config/predator-platform-pricing";
import {
  formatPredatorRp,
  getCurrentPredatorRankLabel,
  getPredatorTrackerLabel,
  getPredatorTrackerRp,
  predatorRankHasIcon,
} from "@/lib/orders/predator-rank-progress";
import { cn } from "@/lib/utils";
import type { PredatorRankProgress } from "@/types/predator";

type PredatorTrackerProgressProps = {
  progress?: PredatorRankProgress[];
  customRp?: number | null;
  startingRank?: string | null;
  variant?: "full" | "compact";
  className?: string;
};

function CompactRankStrip({
  progress,
  fallbackRank,
}: {
  progress: PredatorRankProgress[];
  fallbackRank: string;
}) {
  const steps =
    progress.length > 0
      ? progress
      : PREDATOR_RANK_LADDER.map((rank, index) => ({
          id: rank,
          orderId: "",
          rankLabel: rank,
          status:
            rank === fallbackRank
              ? ("in_progress" as const)
              : ("pending" as const),
          completedAt: null,
          sortOrder: index,
          notes: null,
        }));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((step) => {
        const isCompleted = step.status === "completed";
        const isActive = step.status === "in_progress";

        if (predatorRankHasIcon(step.rankLabel)) {
          return (
            <span
              key={step.id}
              className={cn(
                "relative inline-flex rounded-md",
                isActive && "ring-2 ring-amber-400/60",
                !isCompleted && !isActive && "opacity-35"
              )}
            >
              <RankIcon tier={step.rankLabel} size="sm" />
              {isCompleted ? (
                <span className="absolute -right-1 -top-1 flex size-3.5 items-center justify-center rounded-full bg-primary">
                  <Check className="size-2 text-primary-foreground" />
                </span>
              ) : null}
            </span>
          );
        }

        return (
          <span
            key={step.id}
            className={cn(
              "flex size-6 items-center justify-center rounded-md border text-[9px] font-semibold uppercase",
              isActive
                ? "border-amber-400/50 bg-amber-500/10 text-amber-200"
                : isCompleted
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-white/10 text-muted-foreground"
            )}
          >
            R
          </span>
        );
      })}
    </div>
  );
}

export function PredatorTrackerProgress({
  progress = [],
  customRp,
  startingRank,
  variant = "full",
  className,
}: PredatorTrackerProgressProps) {
  const headline = getPredatorTrackerLabel({
    progress,
    customRp,
    startingRank,
  });
  const rpValue = getPredatorTrackerRp(customRp, startingRank);
  const rpLabel = formatPredatorRp(rpValue);
  const currentRank =
    progress.length > 0
      ? getCurrentPredatorRankLabel(progress)
      : headline.split(" · ")[0] ?? "Rookie";

  if (variant === "full" && progress.length > 0) {
    return (
      <div className={className}>
        <PredatorProgressDisplay progress={progress} customRp={customRp} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>Progress</span>
        <span className="text-right font-mono text-sm font-semibold text-primary">
          {headline}
        </span>
      </div>

      <CompactRankStrip progress={progress} fallbackRank={currentRank} />

      {rpLabel ? (
        <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
          Current RP: <span className="text-foreground">{rpLabel}</span>
        </p>
      ) : null}
    </div>
  );
}
