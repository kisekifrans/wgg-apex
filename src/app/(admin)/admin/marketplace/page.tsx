import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MarketplaceFilters } from "@/components/admin/marketplace/marketplace-filters";
import { MarketplaceListingsGrid } from "@/components/admin/marketplace/marketplace-listings-grid";
import { Button } from "@/components/ui/button";
import { getAdminMarketplaceListings } from "@/lib/db/marketplace-listings";
import type {
  MarketplaceListingFilters,
  MarketplaceListingStatus,
  MarketplacePlatform,
} from "@/types/marketplace";

export const metadata = {
  title: "Account Marketplace",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    platform?: string;
  }>;
};

export default async function AdminMarketplacePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: MarketplaceListingFilters = {
    q: params.q,
    status: (params.status as MarketplaceListingFilters["status"]) ?? "all",
    platform: (params.platform as MarketplaceListingFilters["platform"]) ?? "all",
  };

  let listings: Awaited<ReturnType<typeof getAdminMarketplaceListings>> = [];
  let error: string | null = null;

  try {
    listings = await getAdminMarketplaceListings(filters);
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Failed to load listings. Run Supabase migrations.";
  }

  return (
    <>
      <AdminPageHeader
        title="Account Marketplace"
        description="Create and manage account listings with images, pricing, and availability status."
      >
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
          render={<Link href="/admin/marketplace/new" />}
        >
          <Plus className="size-4" data-icon="inline-start" />
          New listing
        </Button>
      </AdminPageHeader>

      <Suspense fallback={<FiltersSkeleton />}>
        <MarketplaceFilters />
      </Suspense>

      {error ? (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <div className="mt-6">
          <p className="mb-4 text-sm text-muted-foreground">
            {listings.length} listing{listings.length === 1 ? "" : "s"} — sold
            accounts stay visible with a sold overlay.
          </p>
          <MarketplaceListingsGrid listings={listings} />
        </div>
      )}
    </>
  );
}

function FiltersSkeleton() {
  return (
    <div className="h-[140px] animate-pulse rounded-xl border border-white/5 bg-card/40" />
  );
}
