import { parseRankTierFromLabel } from "@/config/brand-assets";
import { PREDATOR_RANK_LADDER } from "@/config/predator-platform-pricing";
import type { PredatorRankProgress } from "@/types/predator";

const RANKS_WITH_ICONS = new Set([
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Master",
  "Predator",
]);

export function predatorRankHasIcon(rankLabel: string): boolean {
  return RANKS_WITH_ICONS.has(rankLabel);
}

export function formatPredatorRp(rp: number | null | undefined): string | null {
  if (rp == null || rp < 0) return null;
  return `${rp.toLocaleString("en-US")} RP`;
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

/** Derived percent for internal sync only — predator orders show rank ladder in the UI. */
export function computePredatorDerivedPercent(
  progress: PredatorRankProgress[],
  customRp?: number | null
): number {
  const total = progress.length || PREDATOR_RANK_LADDER.length;
  if (total === 0) return 0;

  let score = progress.filter((step) => step.status === "completed").length;

  const active = progress.find((step) => step.status === "in_progress");
  if (active) score += 0.5;

  const predatorStep = progress.find((step) => step.rankLabel === "Predator");
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
  const current = getCurrentPredatorRankLabel(progress);
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

  const tier =
    parseRankTierFromLabel(input.startingRank ?? "") ??
    PREDATOR_RANK_LADDER[0];
  const rp = input.customRp ?? parseRpFromRankText(input.startingRank);
  const rpLabel = formatPredatorRp(rp);

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
