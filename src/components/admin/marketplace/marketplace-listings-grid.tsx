import Link from "next/link";
import { Pencil } from "lucide-react";

import { ListingCardImage } from "@/components/admin/marketplace/listing-card-image";
import { ListingStatusBadge } from "@/components/admin/marketplace/listing-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatListingPrice } from "@/lib/marketplace/format";
import type { MarketplaceListing } from "@/types/marketplace";
import { MARKETPLACE_PLATFORMS } from "@/types/marketplace";

function platformLabel(platform: string) {
  return MARKETPLACE_PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
}

export function MarketplaceListingsGrid({
  listings,
}: {
  listings: MarketplaceListing[];
}) {
  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-card/30 px-6 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No listings match your filters. Create your first account listing.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => (
        <Card
          key={listing.id}
          className="overflow-hidden border-white/5 bg-card/50"
        >
          <CardHeader className="p-0">
            <ListingCardImage listing={listing} className="rounded-none" />
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{listing.title}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {listing.listingNumber}
                </p>
              </div>
              <ListingStatusBadge status={listing.status} />
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Rank</dt>
                <dd className="font-medium">{listing.rankLabel}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Platform</dt>
                <dd>{platformLabel(listing.platform)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Heirlooms</dt>
                <dd>{listing.heirloomCount}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Price</dt>
                <dd className="font-mono font-semibold tabular-nums">
                  {formatListingPrice(listing.priceCents)}
                </dd>
              </div>
            </dl>
          </CardContent>
          <CardFooter className="border-t border-white/5 p-4">
            <Button
              size="sm"
              variant="outline"
              className="w-full border-white/10"
              render={<Link href={`/admin/marketplace/${listing.id}`} />}
            >
              <Pencil className="size-4" data-icon="inline-start" />
              Edit listing
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
