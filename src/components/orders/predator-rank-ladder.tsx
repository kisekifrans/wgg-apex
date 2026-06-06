import { Check } from "lucide-react";

import { RankIcon } from "@/components/shared/rank-icon";
import { cn } from "@/lib/utils";
import {
  formatPredatorRp,
  getPredatorProgressHeadline,
  predatorRankHasIcon,
  resolvePredatorDisplayLadder,
} from "@/lib/orders/predator-rank-progress";
import type { PredatorRankProgress } from "@/types/predator";

type PredatorRankLadderProps = {
  progress: PredatorRankProgress[];
  customRp?: number | null;
  variant?: "customer" | "admin";
};

function RankStepIcon({
  rankLabel,
  status,
}: {
  rankLabel: string;
  status: PredatorRankProgress["status"];
}) {
  if (status === "completed") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/15">
        <Check className="size-4 text-primary" aria-hidden />
      </span>
    );
  }

  if (predatorRankHasIcon(rankLabel)) {
    return (
      <RankIcon
        tier={rankLabel}
        size="md"
        className={cn(
          status === "in_progress" && "ring-2 ring-amber-400/60",
          status === "pending" && "opacity-40"
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-md border text-[10px] font-semibold uppercase",
        status === "in_progress"
          ? "border-amber-400/50 bg-amber-500/10 text-amber-200"
          : "border-white/10 bg-white/[0.02] text-muted-foreground"
      )}
    >
      R
    </span>
  );
}

export function PredatorRankLadder({
  progress,
  customRp,
  variant = "customer",
}: PredatorRankLadderProps) {
  const headline = getPredatorProgressHeadline(progress, customRp);
  const isAdmin = variant === "admin";
  const displayProgress =
    isAdmin ? progress : resolvePredatorDisplayLadder(progress, customRp);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Rank progression</p>
        <p className="font-mono text-sm font-semibold text-primary">{headline}</p>
      </div>

      <ol className={cn("grid gap-2", isAdmin ? "space-y-2" : "sm:grid-cols-2")}>
        {displayProgress.map((step) => {
          const isPredator = step.rankLabel === "Predator";
          const rpLabel =
            isPredator && customRp != null ? formatPredatorRp(customRp) : null;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                step.status === "completed" && "border-primary/30 bg-primary/5",
                step.status === "in_progress" &&
                  "border-amber-500/30 bg-amber-500/5",
                step.status === "pending" && "border-white/10 bg-white/[0.02]"
              )}
            >
              <RankStepIcon rankLabel={step.rankLabel} status={step.status} />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    step.status === "completed" && "text-primary",
                    step.status === "in_progress" && "text-amber-200",
                    step.status === "pending" && "text-muted-foreground"
                  )}
                >
                  {step.rankLabel}
                </p>
                {rpLabel ? (
                  <p className="font-mono text-xs tabular-nums text-muted-foreground">
                    {rpLabel}
                  </p>
                ) : null}
              </div>
              {!isAdmin ? (
                <span
                  className={cn(
                    "shrink-0 text-[10px] font-medium uppercase tracking-wide",
                    step.status === "completed" && "text-primary",
                    step.status === "in_progress" && "text-amber-300",
                    step.status === "pending" && "text-muted-foreground/70"
                  )}
                >
                  {step.status === "completed"
                    ? "Done"
                    : step.status === "in_progress"
                      ? "Active"
                      : "Pending"}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="text-xs text-muted-foreground">
        Predator Maintenance progresses rank by rank from Rookie through Predator.
        {customRp != null ? " Custom Predator RP is shown on the Predator step." : ""}
      </p>
    </div>
  );
}
