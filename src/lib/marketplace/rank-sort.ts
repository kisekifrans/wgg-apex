/**
 * Maps Apex rank labels to a numeric sort key (higher = higher rank).
 * Supports common tier names; unknown labels sort to the middle.
 */

const TIER_BASE: Record<string, number> = {
  bronze: 100,
  silver: 200,
  gold: 300,
  platinum: 400,
  diamond: 500,
  master: 600,
  predator: 700,
};

const DIVISION_OFFSET: Record<string, number> = {
  "4": 0,
  iv: 0,
  "3": 1,
  iii: 1,
  "2": 2,
  ii: 2,
  "1": 3,
  i: 3,
};

export function getRankSortScore(rankLabel: string): number {
  const normalized = rankLabel.toLowerCase().trim();

  for (const [tier, base] of Object.entries(TIER_BASE)) {
    if (normalized.includes(tier)) {
      let offset = 2;
      for (const [div, value] of Object.entries(DIVISION_OFFSET)) {
        if (normalized.includes(div)) {
          offset = value;
          break;
        }
      }
      return base + offset;
    }
  }

  if (normalized.includes("apex predator")) return 750;

  return 250;
}

export function compareRankLabels(a: string, b: string): number {
  return getRankSortScore(a) - getRankSortScore(b);
}
