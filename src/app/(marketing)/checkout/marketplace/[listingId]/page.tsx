import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { PaymentPreviewNotice } from "@/components/checkout/payment-preview-notice";
import { Button } from "@/components/ui/button";
import {
  getPublicMarketplaceListingByRef,
  isMarketplaceListingUuid,
} from "@/lib/db/marketplace-listings";
import {
  marketplaceCheckoutPath,
  marketplaceListingPath,
} from "@/lib/marketplace/paths";
import { getPayPalEnv } from "@/lib/paypal/env";

type PageProps = {
  params: Promise<{ listingId: string }>;
};

export default async function MarketplaceCheckoutPage({ params }: PageProps) {
  const { listingId } = await params;

  const listing = await getPublicMarketplaceListingByRef(listingId);
  if (!listing || listing.status !== "available") {
    notFound();
  }

  if (isMarketplaceListingUuid(listingId)) {
    redirect(marketplaceCheckoutPath(listing));
  }

  const { isConfigured: isCheckoutConfigured } = getPayPalEnv();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-6 text-muted-foreground"
        render={<Link href={marketplaceListingPath(listing)} />}
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

      <div className="space-y-6">
        {!isCheckoutConfigured && <PaymentPreviewNotice />}
        <CheckoutForm
          mode="marketplace"
          listing={listing}
          paymentsEnabled={isCheckoutConfigured}
        />
      </div>
    </div>
  );
}
