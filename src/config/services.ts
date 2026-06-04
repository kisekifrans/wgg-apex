import type { PricingEngine } from "@/types/services";

export const PRICING_ENGINE_LABELS: Record<PricingEngine, string> = {
  tier_table: "Rank tier table",
  catalog_items: "Catalog items (badges)",
  subscription_plans: "Subscription plans",
  flat_fee: "Flat fee",
  marketplace: "Marketplace (listings)",
};

export const DIFFICULTY_OPTIONS = ["Standard", "Advanced", "Elite"] as const;
