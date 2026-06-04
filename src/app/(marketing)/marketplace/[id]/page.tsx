import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Monitor, ShieldCheck } from "lucide-react";

import { ListingImageGallery } from "@/components/marketplace/listing-image-gallery";
import { ListingStatusBadge } from "@/components/marketplace/listing-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPublicMarketplaceListingById } from "@/lib/db/marketplace-listings";
import { formatListingPrice } from "@/lib/marketplace/format";
import { MARKETPLACE_PLATFORMS } from "@/types/marketplace";

type PageProps = {
  params: Promise<{ id: string }>;
};

function platformLabel(platform: string) {
  return MARKETPLACE_PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const listing = await getPublicMarketplaceListingById(id).catch(() => null);

  if (!listing) {
    return { title: "Listing not found" };
  }

  return {
    title: listing.title,
    description:
      listing.description?.slice(0, 160) ??
      `${listing.rankLabel} account on ${platformLabel(listing.platform)}`,
  };
}

export default async function MarketplaceDetailPage({ params }: PageProps) {
  const { id } = await params;

  let listing = null;
  try {
    listing = await getPublicMarketplaceListingById(id);
  } catch {
    notFound();
  }

  if (!listing) {
    notFound();
  }

  const isAvailable = listing.status === "available";

  return (
    <div className="pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-6 text-muted-foreground"
          render={<Link href="/marketplace" />}
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back to marketplace
        </Button>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <ListingImageGallery listing={listing} />

          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <ListingStatusBadge status={listing.status} />
                <span className="font-mono text-xs text-muted-foreground">
                  {listing.listingNumber}
                </span>
              </div>
              <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">
                {listing.title}
              </h1>
              <p className="mt-4 font-mono text-3xl font-semibold tabular-nums text-primary">
                {formatListingPrice(listing.priceCents, listing.currency)}
              </p>
            </div>

            <Card className="border-white/5 bg-card/50">
              <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
                <DetailItem label="Rank" value={listing.rankLabel} />
                <DetailItem
                  label="Platform"
                  value={
                    <span className="inline-flex items-center gap-2">
                      <Monitor className="size-4 text-muted-foreground" />
                      {platformLabel(listing.platform)}
                    </span>
                  }
                />
                {listing.rpLabel && (
                  <DetailItem label="RP" value={listing.rpLabel} mono />
                )}
                <DetailItem
                  label="Heirlooms"
                  value={String(listing.heirloomCount)}
                />
                <DetailItem
                  label="Status"
                  value={
                    <span className="capitalize">
                      {listing.status}
                      {listing.status === "sold" && listing.soldAt && (
                        <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                          Sold {new Date(listing.soldAt).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  }
                />
              </CardContent>
            </Card>

            {listing.description && (
              <div>
                <h2 className="font-heading text-lg font-semibold">Description</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {listing.description}
                </p>
              </div>
            )}

            {listing.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {listing.tags.map((tag) => (
                  <li key={tag}>
                    <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Separator className="bg-white/5" />

            {isAvailable ? (
              <div className="space-y-3">
                <Button
                  size="lg"
                  className="h-11 w-full bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
                  render={
                    <Link href={`/checkout/marketplace/${listing.id}`} />
                  }
                >
                  Purchase with Stripe
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Secure checkout powered by Stripe. You will confirm Discord
                  contact before payment.
                </p>
              </div>
            ) : listing.status === "sold" ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p>
                    This account has been sold and is shown as verified social
                    proof. Browse available listings for current inventory.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="mt-4 w-full border-white/10"
                  render={<Link href="/marketplace?status=available" />}
                >
                  View available accounts
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This listing is currently reserved. Contact support for
                availability updates.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={
          mono
            ? "mt-1 font-mono font-medium tabular-nums"
            : "mt-1 text-sm font-medium"
        }
      >
        {value}
      </dd>
    </div>
  );
}
