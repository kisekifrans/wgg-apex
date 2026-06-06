import { PredatorRankLadder } from "@/components/orders/predator-rank-ladder";
import type { PredatorRankProgress } from "@/types/predator";

type PredatorProgressDisplayProps = {
  progress: PredatorRankProgress[];
  customRp?: number | null;
};

export function PredatorProgressDisplay({
  progress,
  customRp,
}: PredatorProgressDisplayProps) {
  if (progress.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <PredatorRankLadder
        progress={progress}
        customRp={customRp}
        variant="customer"
      />
    </div>
  );
}
