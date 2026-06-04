export type MarketplaceListingStatus =
  | "draft"
  | "available"
  | "reserved"
  | "sold";

export type MarketplacePlatform = "pc" | "playstation" | "xbox" | "switch";

export type MarketplaceListingImage = {
  id: string;
  listingId: string;
  storagePath: string;
  publicUrl: string;
  sortOrder: number;
  altText: string | null;
};

export type MarketplaceListing = {
  id: string;
  listingNumber: string;
  title: string;
  description: string | null;
  rankLabel: string;
  rpLabel: string | null;
  platform: MarketplacePlatform;
  priceCents: number;
  currency: string;
  heirloomCount: number;
  /** Number of legendary skins on the account */
  ballerCount: number;
  status: MarketplaceListingStatus;
  isFeatured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  soldAt: string | null;
  images: MarketplaceListingImage[];
};

export type MarketplaceListingFilters = {
  q?: string;
  status?: MarketplaceListingStatus | "all";
  platform?: MarketplacePlatform | "all";
};

export type MarketplaceSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "rank_asc"
  | "rank_desc";

export type PublicMarketplaceQuery = MarketplaceListingFilters & {
  sort?: MarketplaceSortOption;
};

export const PUBLIC_MARKETPLACE_STATUSES: {
  value: MarketplaceListingStatus | "all";
  label: string;
}[] = [
  { value: "all", label: "All listings" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
];

export const MARKETPLACE_SORT_OPTIONS: {
  value: MarketplaceSortOption;
  label: string;
}[] = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to high" },
  { value: "price_desc", label: "Price: High to low" },
  { value: "rank_desc", label: "Rank: High to low" },
  { value: "rank_asc", label: "Rank: Low to high" },
];

export const MARKETPLACE_STATUSES: {
  value: MarketplaceListingStatus;
  label: string;
}[] = [
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "sold", label: "Sold" },
];

export const MARKETPLACE_PLATFORMS: {
  value: MarketplacePlatform;
  label: string;
}[] = [
  { value: "pc", label: "PC" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "switch", label: "Switch" },
];
