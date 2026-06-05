import { Check, Circle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PredatorRankProgress } from "@/lib/db/predator-progress";

type PredatorProgressDisplayProps = {
  progress: PredatorRankProgress[];
};

export function PredatorProgressDisplay({
  progress,
}: PredatorProgressDisplayProps) {
  if (progress.length === 0) return null;

  const completed = progress.filter((p) => p.status === "completed").length;
  const percent = Math.round((completed / progress.length) * 100);

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium">Nintendo rank progression</p>
        <p className="font-mono text-sm tabular-nums text-primary">{percent}%</p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {progress.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
              step.status === "completed" && "text-primary",
              step.status === "in_progress" && "text-amber-300",
              step.status === "pending" && "text-muted-foreground"
            )}
          >
            {step.status === "completed" ? (
              <Check className="size-3.5 shrink-0" />
            ) : (
              <Circle className="size-3.5 shrink-0" />
            )}
            {step.rankLabel}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-muted-foreground">
        Predator Maintenance on Nintendo starts from Rookie rank progression.
      </p>
    </div>
  );
}
