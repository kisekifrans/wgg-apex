import Link from "next/link";
import { Monitor } from "lucide-react";

import { ListingCardImage } from "@/components/marketplace/listing-card-image";
import { RankIcon } from "@/components/shared/rank-icon";
import { ListingStatusBadge } from "@/components/marketplace/listing-status-badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatListingPrice } from "@/lib/marketplace/format";
import type { MarketplaceListing } from "@/types/marketplace";
import { MARKETPLACE_PLATFORMS } from "@/types/marketplace";

function platformLabel(platform: string) {
  return MARKETPLACE_PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
}

export function MarketplaceListingCard({
  listing,
  priority = false,
}: {
  listing: MarketplaceListing;
  priority?: boolean;
}) {
  const isAvailable = listing.status === "available";

  return (
    <Link href={`/marketplace/${listing.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden border-white/5 bg-card/50 transition-all duration-300 hover:border-primary/25 hover:bg-card/80">
        <CardHeader className="p-0">
          <ListingCardImage
            listing={listing}
            className="rounded-none"
            priority={priority}
          />
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg leading-snug transition-colors group-hover:text-primary">
              {listing.title}
            </CardTitle>
            <ListingStatusBadge status={listing.status} className="shrink-0" />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Monitor className="size-4 shrink-0" aria-hidden />
            {platformLabel(listing.platform)}
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Rank</dt>
              <dd className="flex items-center gap-2 font-medium">
                <RankIcon tier={listing.rankLabel} size="sm" />
                <span>{listing.rankLabel}</span>
              </dd>
            </div>
            {listing.rpLabel ? (
              <div>
                <dt className="text-muted-foreground">RP</dt>
                <dd className="font-mono tabular-nums font-medium">
                  {listing.rpLabel}
                </dd>
              </div>
            ) : (
              <div>
                <dt className="text-muted-foreground">Heirlooms</dt>
                <dd>{listing.heirloomCount}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Baller</dt>
              <dd>{listing.ballerCount}</dd>
            </div>
          </dl>
          {listing.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {listing.tags.slice(0, 3).map((tag) => (
                <li key={tag}>
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        <CardFooter className="mt-auto flex items-center justify-between border-t border-white/5 p-5">
          <span className="font-mono text-xl font-semibold tabular-nums">
            {formatListingPrice(listing.priceCents, listing.currency)}
          </span>
          <span
            className={
              isAvailable
                ? "text-sm font-medium text-primary"
                : "text-xs capitalize text-muted-foreground"
            }
          >
            {isAvailable ? "View details" : listing.status}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
