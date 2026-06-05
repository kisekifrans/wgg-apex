import type { CheckoutPlatform } from "@/config/checkout-options";

export type PredatorPlanName = "Core" | "Pro" | "Elite";

export type PredatorPlanPrices = Record<PredatorPlanName, number>;

export type PredatorPlatformPricingMatrix = Record<
  CheckoutPlatform,
  PredatorPlanPrices
>;

/** Nintendo (Switch) base plan prices before processing fee. */
export const DEFAULT_PREDATOR_NINTENDO_PLANS: PredatorPlanPrices = {
  Core: 18500,
  Pro: 26500,
  Elite: 45000,
};

export const DEFAULT_PREDATOR_PLATFORM_PRICING: PredatorPlatformPricingMatrix = {
  switch: { Core: 18500, Pro: 26500, Elite: 45000 },
  pc: { Core: 40000, Pro: 55000, Elite: 95000 },
  xbox: { Core: 23500, Pro: 35000, Elite: 65000 },
  playstation: { Core: 35000, Pro: 50000, Elite: 95000 },
};

function isPlanName(name: string): name is PredatorPlanName {
  return name === "Core" || name === "Pro" || name === "Elite";
}

function isPlanPrices(value: unknown): value is PredatorPlanPrices {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<PredatorPlanPrices>;
  return (
    typeof p.Core === "number" &&
    typeof p.Pro === "number" &&
    typeof p.Elite === "number"
  );
}

/** @deprecated Legacy single Core baseline per platform — used only for old DB rows. */
type LegacyPredatorPlatformPricing = {
  switch: number;
  pc: number;
  xbox: number;
  playstation: number;
};

function isLegacyPricing(
  raw: unknown
): raw is LegacyPredatorPlatformPricing {
  if (!raw || typeof raw !== "object") return false;
  const p = raw as Record<string, unknown>;
  return typeof p.switch === "number" && !isPlanPrices(p.switch);
}

function scalePlanPrices(
  nintendoPlans: PredatorPlanPrices,
  platformCoreBaseline: number
): PredatorPlanPrices {
  const nintendoCore = nintendoPlans.Core;
  if (nintendoCore <= 0) return nintendoPlans;
  const ratio = platformCoreBaseline / nintendoCore;
  return {
    Core: Math.round(nintendoPlans.Core * ratio),
    Pro: Math.round(nintendoPlans.Pro * ratio),
    Elite: Math.round(nintendoPlans.Elite * ratio),
  };
}

export function parsePredatorPlatformPricing(
  displayConfig: Record<string, unknown> | null | undefined,
  nintendoPlans: PredatorPlanPrices = DEFAULT_PREDATOR_NINTENDO_PLANS
): PredatorPlatformPricingMatrix {
  const raw = displayConfig?.predator_platform_pricing;
  if (!raw || typeof raw !== "object") {
    return DEFAULT_PREDATOR_PLATFORM_PRICING;
  }

  if (isLegacyPricing(raw)) {
    return {
      switch: nintendoPlans,
      pc: scalePlanPrices(nintendoPlans, raw.pc),
      xbox: scalePlanPrices(nintendoPlans, raw.xbox),
      playstation: scalePlanPrices(nintendoPlans, raw.playstation),
    };
  }

  const matrix = raw as Partial<PredatorPlatformPricingMatrix>;
  const fallback = DEFAULT_PREDATOR_PLATFORM_PRICING;

  return {
    switch: isPlanPrices(matrix.switch) ? matrix.switch : fallback.switch,
    pc: isPlanPrices(matrix.pc) ? matrix.pc : fallback.pc,
    xbox: isPlanPrices(matrix.xbox) ? matrix.xbox : fallback.xbox,
    playstation: isPlanPrices(matrix.playstation)
      ? matrix.playstation
      : fallback.playstation,
  };
}

export function computePredatorPlanPriceCents(
  planName: string,
  platform: CheckoutPlatform,
  platformPricing: PredatorPlatformPricingMatrix = DEFAULT_PREDATOR_PLATFORM_PRICING
): number {
  if (!isPlanName(planName)) {
    return platformPricing.switch.Core;
  }
  return platformPricing[platform][planName];
}

export const PREDATOR_PLATFORMS: {
  value: CheckoutPlatform;
  label: string;
  description: string;
}[] = [
  {
    value: "switch",
    label: "Nintendo (Switch)",
    description: "From $185 · lowest rate",
  },
  { value: "pc", label: "PC (Origin/Steam)", description: "From $400" },
  { value: "xbox", label: "Xbox", description: "From $235" },
  { value: "playstation", label: "PlayStation", description: "From $350" },
];

export const PREDATOR_RANK_LADDER = [
  "Rookie",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Master",
  "Predator",
] as const;
