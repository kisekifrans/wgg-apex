import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Button } from "@/components/ui/button";
import { getPublicMarketplaceListingById } from "@/lib/db/marketplace-listings";
import { getStripeEnv } from "@/lib/stripe/env";

type PageProps = {
  params: Promise<{ listingId: string }>;
};

export default async function MarketplaceCheckoutPage({ params }: PageProps) {
  const { listingId } = await params;

  const listing = await getPublicMarketplaceListingById(listingId);
  if (!listing || listing.status !== "available") {
    notFound();
  }

  const { isCheckoutConfigured } = getStripeEnv();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-6 text-muted-foreground"
        render={<Link href={`/marketplace/${listingId}`} />}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to listing
      </Button>

      <div className="mb-8">
        <p className="font-mono text-xs text-muted-foreground">
          {listing.listingNumber}
        </p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight">
          Purchase account
        </h1>
        <p className="mt-2 text-muted-foreground">{listing.title}</p>
      </div>

      {!isCheckoutConfigured ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          Stripe is not configured.
        </div>
      ) : (
        <CheckoutForm mode="marketplace" listing={listing} />
      )}
    </div>
  );
}
