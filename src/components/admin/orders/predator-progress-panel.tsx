"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  initPredatorProgress,
  updatePredatorCustomRp,
  updatePredatorRankStatus,
} from "@/actions/admin/orders/predator-progress";
import { PredatorRankLadder } from "@/components/orders/predator-rank-ladder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PredatorRankProgress } from "@/lib/db/predator-progress";

type PredatorProgressPanelProps = {
  orderId: string;
  progress: PredatorRankProgress[];
  customRp?: number | null;
};

export function PredatorProgressPanel({
  orderId,
  progress,
  customRp = null,
}: PredatorProgressPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rpInput, setRpInput] = useState(
    customRp != null ? String(customRp) : ""
  );

  useEffect(() => {
    setRpInput(customRp != null ? String(customRp) : "");
  }, [customRp]);

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

  function handleSaveRp() {
    const trimmed = rpInput.trim();
    const parsed = trimmed === "" ? null : Number(trimmed.replace(/,/g, ""));

    startTransition(async () => {
      const result = await updatePredatorCustomRp(orderId, parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        parsed == null ? "Custom Predator RP cleared" : "Custom Predator RP saved"
      );
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
          Predator Maintenance starts at Rookie and advances rank by rank through
          Bronze, Silver, Gold, Platinum, Diamond, Master, and Predator.
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
    <section className="space-y-6 rounded-xl border border-white/5 bg-card/40 p-6">
      <PredatorRankLadder
        progress={progress}
        customRp={customRp}
        variant="admin"
      />

      <ol className="space-y-2 border-t border-white/5 pt-4">
        {progress.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3",
              step.status === "completed" && "border-primary/30 bg-primary/5",
              step.status === "in_progress" && "border-amber-500/30 bg-amber-500/5",
              step.status === "pending" && "border-white/10 bg-background/30"
            )}
          >
            <span className="text-sm font-medium">{step.rankLabel}</span>
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

      <div className="space-y-3 border-t border-white/5 pt-4">
        <div>
          <h3 className="text-sm font-semibold">Custom Predator RP</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Shown on the Predator rank step for customers tracking their order.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 15200"
            value={rpInput}
            disabled={pending}
            onChange={(e) => setRpInput(e.target.value)}
            className="max-w-[180px] border-white/10 bg-background/50 font-mono tabular-nums"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/10"
            disabled={pending}
            onClick={handleSaveRp}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : null}
            Save RP
          </Button>
        </div>
      </div>
    </section>
  );
}
