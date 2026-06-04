export const PRICING_ENGINES = [
  "tier_table",
  "catalog_items",
  "subscription_plans",
  "flat_fee",
  "marketplace",
] as const;

export type PricingEngine = (typeof PRICING_ENGINES)[number];

export type ServiceDisplayConfig = {
  homepage_section?: string;
  features?: string[];
  /** Public path, e.g. /heroes/thumbnail2.jpg */
  thumbnail_path?: string;
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
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
};

export type PublicServicesCatalog = {
  featuredService: CatalogService | null;
  overview: CatalogService[];
  rankedBoost: CatalogService | null;
  predatorMaintenance: CatalogService | null;
  badgeBoosting: CatalogService | null;
  unbanService: CatalogService | null;
};
