"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  initPredatorProgress,
  updatePredatorRankStatus,
} from "@/actions/admin/orders/predator-progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PredatorRankProgress } from "@/lib/db/predator-progress";

type PredatorProgressPanelProps = {
  orderId: string;
  progress: PredatorRankProgress[];
};

export function PredatorProgressPanel({
  orderId,
  progress,
}: PredatorProgressPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleInit() {
    startTransition(async () => {
      const result = await initPredatorProgress(orderId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Predator rank ladder initialized");
      router.refresh();
    });
  }

  function handleStatusChange(
    progressId: string,
    status: PredatorRankProgress["status"]
  ) {
    startTransition(async () => {
      const result = await updatePredatorRankStatus(
        progressId,
        orderId,
        status
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (progress.length === 0) {
    return (
      <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
        <h2 className="font-heading text-lg font-semibold">
          Nintendo rank progression
        </h2>
        <p className="text-sm text-muted-foreground">
          Predator Maintenance on Nintendo starts from Rookie rank progression.
          Initialize the ladder to track Rookie → Predator.
        </p>
        <Button type="button" disabled={pending} onClick={handleInit}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : null}
          Initialize rank ladder
        </Button>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
      <div>
        <h2 className="font-heading text-lg font-semibold">
          Nintendo rank progression
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track Rookie → Bronze → Silver → Gold → Platinum → Diamond → Master →
          Predator
        </p>
      </div>

      <ol className="space-y-2">
        {progress.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border px-4 py-3",
              step.status === "completed" && "border-primary/30 bg-primary/5",
              step.status === "in_progress" && "border-amber-500/30 bg-amber-500/5",
              step.status === "pending" && "border-white/10 bg-background/30"
            )}
          >
            <div className="flex items-center gap-3">
              {step.status === "completed" ? (
                <Check className="size-4 text-primary" />
              ) : (
                <Circle
                  className={cn(
                    "size-4",
                    step.status === "in_progress"
                      ? "text-amber-400"
                      : "text-muted-foreground"
                  )}
                />
              )}
              <span className="font-medium">{step.rankLabel}</span>
            </div>
            <select
              value={step.status}
              disabled={pending}
              onChange={(e) =>
                handleStatusChange(
                  step.id,
                  e.target.value as PredatorRankProgress["status"]
                )
              }
              className="field-select h-8 rounded-md border border-white/10 bg-background/50 px-2 text-xs"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </li>
        ))}
      </ol>
    </section>
  );
}
