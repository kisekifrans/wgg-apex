/**
 * Static marketing assets under /public.
 * @see docs/ASSET_MAP.md
 */
export const brandAssets = {
  logo: "/logo/wgg.png",
  brandHero: "/images/wgg-brand-hero.png",
} as const;

import type { ServiceDisplayConfig } from "@/types/services";

/** Default homepage card art when admin has not set `display_config.thumbnail_path`. */
export const serviceArtworkBySlug: Record<string, string> = {
  "ranked-boosting": "/heroes/thumbnail1.png",
  "predator-maintenance": "/heroes/thumbnail2.jpg",
};

function isSafePublicPath(path: string): boolean {
  return path.startsWith("/") && !path.includes("..");
}

export function getServiceArtworkPath(
  slug: string,
  displayConfig?: ServiceDisplayConfig
): string | undefined {
  const fromCms = displayConfig?.thumbnail_path?.trim();
  if (fromCms && isSafePublicPath(fromCms)) {
    return fromCms;
  }
  return serviceArtworkBySlug[slug];
}

/** Catalog pricing item name → badge image (homepage badge grid, checkout later). */
export const badgeAssetsByCatalogName: Record<string, string> = {
  "20 Kill Badge": "/badges/20kill.png",
  "4000 Damage Badge": "/badges/4kdamage.png",
};

/** Ranked boost tier names from `service_pricing_items.name`. */
export const rankAssetsByTierName: Record<string, string> = {
  Bronze: "/ranks/bronze.png",
  Silver: "/ranks/silver.png",
  Gold: "/ranks/gold.png",
  Platinum: "/ranks/platinum.png",
  Diamond: "/ranks/diamond.png",
  Master: "/ranks/master.png",
  Predator: "/ranks/predator.png",
};

const RANK_TIER_PATTERN =
  /^(bronze|silver|gold|platinum|diamond|master|predator)\b/i;

export function parseRankTierFromLabel(label: string): string | undefined {
  const trimmed = label.trim();
  if (rankAssetsByTierName[trimmed]) return trimmed;

  const titleCase =
    trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  if (rankAssetsByTierName[titleCase]) return titleCase;

  const match = trimmed.match(RANK_TIER_PATTERN);
  if (!match) return undefined;

  const tier = match[1].toLowerCase();
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

export function getRankAssetPath(tierOrLabel: string): string | undefined {
  const tier = parseRankTierFromLabel(tierOrLabel);
  if (!tier) return undefined;
  return rankAssetsByTierName[tier];
}

export function getBadgeAssetPath(catalogName: string): string | undefined {
  return badgeAssetsByCatalogName[catalogName];
}
