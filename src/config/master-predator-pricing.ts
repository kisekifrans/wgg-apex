import type { CheckoutPlatform } from "@/config/checkout-options";
import { formatPriceFromCents } from "@/lib/services/format-price";
import type { CatalogPricingItem } from "@/types/services";

export const MASTER_PREDATOR_FROM_RANK = "Master";
export const MASTER_PREDATOR_TO_RANK = "Predator";
export const MASTER_PREDATOR_BUNDLE_QUERY = "master-predator";

/** Platform-specific base prices (cents) before priority multiplier. */
export const MASTER_PREDATOR_PLATFORM_CENTS: Record<
  "xbox" | "pc" | "playstation",
  number
> = {
  xbox: 17000,
  pc: 35000,
  playstation: 30000,
};

export const MASTER_PREDATOR_PLATFORMS = [
  { value: "xbox" as const, label: "Xbox", cents: 17000 },
  { value: "pc" as const, label: "PC (Origin / Steam)", cents: 35000 },
  { value: "playstation" as const, label: "PlayStation", cents: 30000 },
];

export function isMasterPredatorSpan(
  currentRank: string | null | undefined,
  targetRank: string | null | undefined
): boolean {
  return (
    currentRank?.trim() === MASTER_PREDATOR_FROM_RANK &&
    targetRank?.trim() === MASTER_PREDATOR_TO_RANK
  );
}

export function isMasterPredatorBundleItem(item: CatalogPricingItem): boolean {
  const meta = item.metadata ?? {};
  return (
    meta.bundle_from === MASTER_PREDATOR_FROM_RANK &&
    meta.bundle_to === MASTER_PREDATOR_TO_RANK
  );
}

export function isMasterPredatorPlatform(
  platform: CheckoutPlatform | null
): platform is keyof typeof MASTER_PREDATOR_PLATFORM_CENTS {
  return (
    platform === "xbox" || platform === "pc" || platform === "playstation"
  );
}

export function computeMasterPredatorBaseCents(
  platform: CheckoutPlatform,
  duoBoost = false
): number | null {
  if (!isMasterPredatorPlatform(platform)) return null;
  const base = MASTER_PREDATOR_PLATFORM_CENTS[platform];
  return duoBoost ? base * 2 : base;
}

export function formatMasterPredatorPlatformLine(
  platform: keyof typeof MASTER_PREDATOR_PLATFORM_CENTS
): string {
  const row = MASTER_PREDATOR_PLATFORMS.find((p) => p.value === platform);
  return row ? `${row.label} — ${formatPriceFromCents(row.cents)}` : platform;
}
