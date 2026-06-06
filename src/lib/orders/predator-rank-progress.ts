import { getRankAssetPath, parseRankTierFromLabel } from "@/config/brand-assets";
import { PREDATOR_RANK_LADDER } from "@/config/predator-platform-pricing";
import type { PredatorRankProgress } from "@/types/predator";

export function predatorRankHasIcon(rankLabel: string): boolean {
  return Boolean(getRankAssetPath(rankLabel));
}

export function formatPredatorRp(rp: number | null | undefined): string | null {
  if (rp == null || rp < 0) return null;
  return `${rp.toLocaleString("en-US")} RP`;
}

type LadderRank = (typeof PREDATOR_RANK_LADDER)[number];

function ladderIndex(rankLabel: string): number {
  return PREDATOR_RANK_LADDER.indexOf(rankLabel as LadderRank);
}

export function getCurrentPredatorRankLabel(
  progress: PredatorRankProgress[]
): string {
  const active = progress.find((step) => step.status === "in_progress");
  if (active) return active.rankLabel;

  const completed = progress.filter((step) => step.status === "completed");
  if (completed.length === 0) return PREDATOR_RANK_LADDER[0];

  return completed[completed.length - 1]?.rankLabel ?? PREDATOR_RANK_LADDER[0];
}

/** Customer-facing rank — custom Predator RP always means Predator tier. */
export function getPredatorDisplayRank(
  progress: PredatorRankProgress[],
  customRp?: number | null
): string {
  if (customRp != null && customRp > 0) {
    return "Predator";
  }

  if (progress.length === 0) {
    return PREDATOR_RANK_LADDER[0];
  }

  const predatorStep = progress.find((step) => step.rankLabel === "Predator");
  if (
    predatorStep?.status === "in_progress" ||
    predatorStep?.status === "completed"
  ) {
    return "Predator";
  }

  return getCurrentPredatorRankLabel(progress);
}

/** Merge ladder DB rows with Predator RP for tracker visuals. */
export function resolvePredatorDisplayLadder(
  progress: PredatorRankProgress[],
  customRp?: number | null
): PredatorRankProgress[] {
  if (progress.length === 0) return progress;

  const displayRank = getPredatorDisplayRank(progress, customRp);
  const displayIndex = ladderIndex(displayRank);
  if (displayIndex < 0) return progress;

  const predatorStep = progress.find((step) => step.rankLabel === "Predator");
  const predatorCompleted = predatorStep?.status === "completed";

  return progress.map((step) => {
    const idx = ladderIndex(step.rankLabel);
    if (idx < 0) return step;

    if (idx < displayIndex) {
      return step.status === "completed"
        ? step
        : { ...step, status: "completed" as const };
    }

    if (idx === displayIndex) {
      if (predatorCompleted) {
        return { ...step, status: "completed" as const };
      }
      return step.status === "pending"
        ? { ...step, status: "in_progress" as const }
        : step;
    }

    return step.status === "pending"
      ? step
      : { ...step, status: "pending" as const };
  });
}

/** Derived percent for internal sync only — predator orders show rank ladder in the UI. */
export function computePredatorDerivedPercent(
  progress: PredatorRankProgress[],
  customRp?: number | null
): number {
  const ladder =
    customRp != null && customRp > 0
      ? resolvePredatorDisplayLadder(progress, customRp)
      : progress;
  const total = ladder.length || PREDATOR_RANK_LADDER.length;
  if (total === 0) return 0;

  let score = ladder.filter((step) => step.status === "completed").length;

  const active = ladder.find((step) => step.status === "in_progress");
  if (active) score += 0.5;

  const predatorStep = ladder.find((step) => step.rankLabel === "Predator");
  if (
    predatorStep &&
    customRp != null &&
    customRp > 0 &&
    predatorStep.status !== "pending"
  ) {
    score = total - 0.25 + Math.min(0.25, customRp / 20000 / 4);
  }

  return Math.min(100, Math.round((score / total) * 100));
}

export function parseRpFromRankText(text: string | null | undefined): number | null {
  if (!text?.trim()) return null;

  const match = text.match(/(\d[\d,]*)\s*(?:rp)?/i);
  if (!match?.[1]) return null;

  const parsed = Number.parseInt(match[1].replace(/,/g, ""), 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function getPredatorProgressHeadline(
  progress: PredatorRankProgress[],
  customRp?: number | null
): string {
  const current = getPredatorDisplayRank(progress, customRp);
  const rpLabel = formatPredatorRp(customRp);

  if (rpLabel) return `${current} · ${rpLabel}`;

  return current;
}

/** Site tracker label — uses rank ladder when present, otherwise checkout starting rank. */
export function getPredatorTrackerLabel(input: {
  progress?: PredatorRankProgress[];
  customRp?: number | null;
  startingRank?: string | null;
}): string {
  const progress = input.progress ?? [];

  if (progress.length > 0) {
    return getPredatorProgressHeadline(progress, input.customRp);
  }

  const rp = input.customRp ?? parseRpFromRankText(input.startingRank);
  const rpLabel = formatPredatorRp(rp);
  const tier =
    rp != null && rp > 0
      ? "Predator"
      : (parseRankTierFromLabel(input.startingRank ?? "") ??
        PREDATOR_RANK_LADDER[0]);

  if (rpLabel) return `${tier} · ${rpLabel}`;

  return tier;
}

export function getPredatorTrackerRp(
  customRp?: number | null,
  startingRank?: string | null
): number | null {
  if (customRp != null && customRp >= 0) return customRp;
  return parseRpFromRankText(startingRank);
}
