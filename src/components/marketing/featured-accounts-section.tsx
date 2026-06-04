import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  AnimatedItem,
  AnimatedSection,
  AnimatedStagger,
} from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import { MarketplaceListingCard } from "@/components/marketplace/marketplace-listing-card";
import { Button } from "@/components/ui/button";
import { getPublicMarketplaceListings } from "@/lib/db/marketplace-listings";
import type { MarketplaceListing } from "@/types/marketplace";

export async function FeaturedAccountsSection() {
  let listings: MarketplaceListing[] = [];

  try {
    const all = await getPublicMarketplaceListings({ sort: "newest" });
    const featured = all.filter((l) => l.isFeatured);
    listings = (featured.length > 0 ? featured : all).slice(0, 3);
  } catch {
    listings = [];
  }

  return (
    <AnimatedSection id="accounts" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="Marketplace"
            title="Featured Accounts for Sale"
            description="Verified listings with rank, RP, and platform disclosed. Sold accounts stay listed so you know what's available."
          />
          <Button
            variant="ghost"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            render={<Link href="/marketplace" />}
          >
            Browse Marketplace
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>

        {listings.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-white/5 bg-card/30 px-6 py-12 text-center text-sm text-muted-foreground">
            Featured listings will appear here once published in the admin
            marketplace.
          </div>
        ) : (
          <AnimatedStagger className="mt-12 grid gap-4 md:grid-cols-3">
            {listings.map((listing, index) => (
              <AnimatedItem key={listing.id}>
                <MarketplaceListingCard listing={listing} priority={index === 0} />
              </AnimatedItem>
            ))}
          </AnimatedStagger>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Listings are subject to availability. Transfer and compliance terms
          apply at checkout.
        </p>
      </div>
    </AnimatedSection>
  );
}
