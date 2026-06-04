import { Suspense } from "react";

import { MarketplaceListingCard } from "@/components/marketplace/marketplace-listing-card";
import { MarketplaceStatsBar } from "@/components/marketplace/marketplace-stats-bar";
import { MarketplaceToolbar } from "@/components/marketplace/marketplace-toolbar";
import { getPublicMarketplaceListings } from "@/lib/db/marketplace-listings";
import type { MarketplaceListing } from "@/types/marketplace";
import type {
  MarketplaceListingStatus,
  MarketplacePlatform,
  MarketplaceSortOption,
  PublicMarketplaceQuery,
} from "@/types/marketplace";

export const metadata = {
  title: "Account Marketplace",
  description:
    "Browse verified Apex Legends accounts. Available, reserved, and sold listings for competitive players.",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    platform?: string;
    sort?: string;
  }>;
};

const VALID_SORTS: MarketplaceSortOption[] = [
  "newest",
  "price_asc",
  "price_desc",
  "rank_asc",
  "rank_desc",
];

const VALID_STATUSES: (MarketplaceListingStatus | "all")[] = [
  "all",
  "available",
  "reserved",
  "sold",
];

export default async function MarketplacePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const sortParam = params.sort as MarketplaceSortOption | undefined;
  const sort =
    sortParam && VALID_SORTS.includes(sortParam) ? sortParam : "newest";

  const statusParam = params.status as MarketplaceListingStatus | "all" | undefined;
  const status =
    statusParam && VALID_STATUSES.includes(statusParam) ? statusParam : "all";

  const platformParam = params.platform as MarketplacePlatform | "all" | undefined;
  const platform =
    platformParam === "pc" ||
    platformParam === "playstation" ||
    platformParam === "xbox" ||
    platformParam === "switch"
      ? platformParam
      : "all";

  const query: PublicMarketplaceQuery = {
    q: params.q,
    status,
    platform,
    sort,
  };

  let listings: MarketplaceListing[] = [];
  let error: string | null = null;

  try {
    listings = await getPublicMarketplaceListings(query);
  } catch (e) {
    error = e instanceof Error ? e.message : "Unable to load listings.";
  }

  return (
    <div className="pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium tracking-wide text-[var(--brand-gold)]">
            Marketplace
          </p>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Account marketplace
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Verified listings with transparent pricing. Sold accounts remain
            visible as social proof of completed transfers.
          </p>
        </div>

        <div className="mt-8">
          <Suspense fallback={<ToolbarSkeleton />}>
            <MarketplaceToolbar />
          </Suspense>
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <>
            <div className="mt-6">
              <MarketplaceStatsBar listings={listings} />
            </div>

            {listings.length === 0 ? (
              <div className="mt-10 rounded-xl border border-dashed border-white/10 bg-card/30 px-6 py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  No listings match your filters. Try adjusting search or show all
                  statuses.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing, index) => (
                  <MarketplaceListingCard
                    key={listing.id}
                    listing={listing}
                    priority={index < 3}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ToolbarSkeleton() {
  return (
    <div className="h-[180px] animate-pulse rounded-xl border border-white/5 bg-card/40" />
  );
}
