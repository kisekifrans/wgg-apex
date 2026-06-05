export const PRICING_ENGINES = [
  "tier_table",
  "catalog_items",
  "subscription_plans",
  "flat_fee",
  "marketplace",
] as const;

export type PricingEngine = (typeof PRICING_ENGINES)[number];

export type PredatorPlanPlatformPrices = {
  Core: number;
  Pro: number;
  Elite: number;
};

export type PredatorPlatformPricingConfig = {
  switch?: PredatorPlanPlatformPrices | number;
  pc?: PredatorPlanPlatformPrices | number;
  xbox?: PredatorPlanPlatformPrices | number;
  playstation?: PredatorPlanPlatformPrices | number;
};

export type ServiceDisplayConfig = {
  homepage_section?: string;
  features?: string[];
  /** Public path, e.g. /heroes/thumbnail2.jpg */
  thumbnail_path?: string;
  predator_platform_pricing?: PredatorPlatformPricingConfig;
};

export type PricingItemMetadata = {
  bundle_from?: string;
  bundle_to?: string;
  additional_rank_cents?: number;
  tier?: string;
  kills_step?: number;
  min_kills?: number;
  cents_per_100_kills?: number;
  reference_kills?: number;
  reference_price_cents?: number;
};

export type CatalogService = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  pricingEngine: PricingEngine;
  icon: string;
  href: string;
  priceLabel: string | null;
  fromPriceCents: number | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  displayConfig: ServiceDisplayConfig;
  createdAt: string;
  updatedAt: string;
  pricingItems: CatalogPricingItem[];
};

export type CatalogPricingItem = {
  id: string;
  serviceId: string;
  name: string;
  subtitle: string | null;
  priceCents: number;
  currency: string;
  etaLabel: string | null;
  difficulty: string | null;
  features: string[];
  metadata: PricingItemMetadata;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type PublicServicesCatalog = {
  featuredService: CatalogService | null;
  overview: CatalogService[];
  rankedBoost: CatalogService | null;
  selfPlayBoost: CatalogService | null;
  predatorMaintenance: CatalogService | null;
  badgeBoosting: CatalogService | null;
  unbanService: CatalogService | null;
};
