import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { compareRankLabels } from "@/lib/marketplace/rank-sort";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  getMarketplaceImagePublicUrl,
} from "@/lib/marketplace/storage";
import type {
  MarketplaceListing,
  MarketplaceListingFilters,
  MarketplaceListingImage,
  MarketplaceListingStatus,
  MarketplacePlatform,
  MarketplaceSortOption,
  PublicMarketplaceQuery,
} from "@/types/marketplace";

type ListingRow = {
  id: string;
  listing_number: string;
  title: string;
  description: string | null;
  rank_label: string;
  rp_label: string | null;
  platform: MarketplacePlatform;
  price_cents: number;
  currency: string;
  heirloom_count: number;
  status: MarketplaceListingStatus;
  is_featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  sold_at: string | null;
};

type ImageRow = {
  id: string;
  listing_id: string;
  storage_path: string;
  sort_order: number;
  alt_text: string | null;
};

const PUBLIC_STATUSES: MarketplaceListingStatus[] = [
  "available",
  "reserved",
  "sold",
];

function mapImage(row: ImageRow): MarketplaceListingImage {
  return {
    id: row.id,
    listingId: row.listing_id,
    storagePath: row.storage_path,
    publicUrl: getMarketplaceImagePublicUrl(row.storage_path),
    sortOrder: row.sort_order,
    altText: row.alt_text,
  };
}

function mapListing(
  row: ListingRow,
  images: ImageRow[] = []
): MarketplaceListing {
  return {
    id: row.id,
    listingNumber: row.listing_number,
    title: row.title,
    description: row.description,
    rankLabel: row.rank_label,
    rpLabel: row.rp_label,
    platform: row.platform,
    priceCents: row.price_cents,
    currency: row.currency,
    heirloomCount: row.heirloom_count,
    status: row.status,
    isFeatured: row.is_featured,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    soldAt: row.sold_at,
    images: images.map(mapImage).sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

async function attachImages(
  supabase: SupabaseClient,
  listings: ListingRow[]
): Promise<MarketplaceListing[]> {
  if (listings.length === 0) return [];

  const ids = listings.map((l) => l.id);

  const { data: images, error } = await supabase
    .from("marketplace_listing_images")
    .select("*")
    .in("listing_id", ids)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  const byListing = new Map<string, ImageRow[]>();
  (images as ImageRow[]).forEach((img) => {
    const list = byListing.get(img.listing_id) ?? [];
    list.push(img);
    byListing.set(img.listing_id, list);
  });

  return listings.map((row) => mapListing(row, byListing.get(row.id) ?? []));
}

function sortListings(
  listings: MarketplaceListing[],
  sort: MarketplaceSortOption = "newest"
): MarketplaceListing[] {
  const copy = [...listings];

  switch (sort) {
    case "price_asc":
      return copy.sort((a, b) => a.priceCents - b.priceCents);
    case "price_desc":
      return copy.sort((a, b) => b.priceCents - a.priceCents);
    case "rank_asc":
      return copy.sort((a, b) => compareRankLabels(a.rankLabel, b.rankLabel));
    case "rank_desc":
      return copy.sort((a, b) => compareRankLabels(b.rankLabel, a.rankLabel));
    case "newest":
    default:
      return copy.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

function applyPublicFilters(
  query: PublicMarketplaceQuery
): MarketplaceListingFilters {
  return {
    q: query.q,
    status: query.status ?? "all",
    platform: query.platform ?? "all",
  };
}

async function fetchPublicListingRows(
  supabase: SupabaseClient,
  filters: MarketplaceListingFilters
): Promise<ListingRow[]> {
  let query = supabase
    .from("marketplace_listings")
    .select("*")
    .in("status", PUBLIC_STATUSES);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.platform && filters.platform !== "all") {
    query = query.eq("platform", filters.platform);
  }

  if (filters.q?.trim()) {
    const safeQ = filters.q.trim().replace(/[%_,]/g, "");
    const term = `%${safeQ}%`;
    query = query.or(
      `title.ilike.${term},listing_number.ilike.${term},rank_label.ilike.${term},description.ilike.${term}`
    );
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data as ListingRow[]) ?? [];
}

export async function getPublicMarketplaceListings(
  query: PublicMarketplaceQuery = {}
): Promise<MarketplaceListing[]> {
  const supabase = await createClient();
  const client = supabase ?? createAdminClient();
  const filters = applyPublicFilters(query);

  const rows = await fetchPublicListingRows(client, filters);
  const listings = await attachImages(client, rows);

  return sortListings(listings, query.sort ?? "newest");
}

export async function getPublicMarketplaceListingById(
  id: string
): Promise<MarketplaceListing | null> {
  const supabase = await createClient();
  const client = supabase ?? createAdminClient();

  const { data, error } = await client
    .from("marketplace_listings")
    .select("*")
    .eq("id", id)
    .in("status", PUBLIC_STATUSES)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: images } = await client
    .from("marketplace_listing_images")
    .select("*")
    .eq("listing_id", id)
    .order("sort_order", { ascending: true });

  return mapListing(data as ListingRow, (images as ImageRow[]) ?? []);
}

export async function getAdminMarketplaceListings(
  filters: MarketplaceListingFilters = {}
): Promise<MarketplaceListing[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("marketplace_listings")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.platform && filters.platform !== "all") {
    query = query.eq("platform", filters.platform);
  }

  if (filters.q?.trim()) {
    const safeQ = filters.q.trim().replace(/[%_,]/g, "");
    const term = `%${safeQ}%`;
    query = query.or(
      `title.ilike.${term},listing_number.ilike.${term},rank_label.ilike.${term},description.ilike.${term}`
    );
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return attachImages(supabase, (data as ListingRow[]) ?? []);
}

export async function getMarketplaceListingById(
  id: string
): Promise<MarketplaceListing | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: images } = await supabase
    .from("marketplace_listing_images")
    .select("*")
    .eq("listing_id", id)
    .order("sort_order", { ascending: true });

  return mapListing(data as ListingRow, (images as ImageRow[]) ?? []);
}

/** @deprecated Use getPublicMarketplaceListings */
export async function getPublicMarketplaceListingsLegacy(options?: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<MarketplaceListing[]> {
  let listings = await getPublicMarketplaceListings({ sort: "newest" });

  if (options?.featuredOnly) {
    listings = listings.filter((l) => l.isFeatured);
  }

  if (options?.limit) {
    listings = listings.slice(0, options.limit);
  }

  return listings;
}
