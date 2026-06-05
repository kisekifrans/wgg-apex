import type { CatalogPricingItem } from "@/types/services";

export type KillsFarmingPricingConfig = {
  killsStep: number;
  minKills: number;
  centsPer100Kills: number;
};

const DEFAULT_CONFIG: KillsFarmingPricingConfig = {
  killsStep: 100,
  minKills: 100,
  centsPer100Kills: 450,
};

export function getKillsFarmingConfig(
  items: CatalogPricingItem[]
): KillsFarmingPricingConfig {
  const item = items.find((i) => i.isActive) ?? items[0];
  if (!item) return DEFAULT_CONFIG;

  const meta = item.metadata ?? {};
  return {
    killsStep:
      typeof meta.kills_step === "number" && meta.kills_step > 0
        ? meta.kills_step
        : DEFAULT_CONFIG.killsStep,
    minKills:
      typeof meta.min_kills === "number" && meta.min_kills > 0
        ? meta.min_kills
        : DEFAULT_CONFIG.minKills,
    centsPer100Kills:
      typeof meta.cents_per_100_kills === "number" &&
      meta.cents_per_100_kills > 0
        ? meta.cents_per_100_kills
        : item.priceCents > 0
          ? item.priceCents
          : DEFAULT_CONFIG.centsPer100Kills,
  };
}

export function formatKillCountLabel(kills: number): string {
  return `${kills.toLocaleString("en-US")} kills`;
}

export function parseKillCountInput(
  value: number | string | null | undefined,
  config: KillsFarmingPricingConfig
): { kills: number } | { error: string } {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value ?? "").trim(), 10);

  if (!Number.isFinite(parsed)) {
    return { error: "Enter a valid kill count" };
  }

  if (parsed < config.minKills) {
    return {
      error: `Minimum order is ${formatKillCountLabel(config.minKills)}`,
    };
  }

  if (parsed % config.killsStep !== 0) {
    return {
      error: `Kill count must be in steps of ${config.killsStep}`,
    };
  }

  return { kills: parsed };
}

export function computeKillsFarmingCents(
  kills: number,
  config: KillsFarmingPricingConfig
): number {
  return Math.round((kills / 100) * config.centsPer100Kills);
}
