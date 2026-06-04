import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ListingForm } from "@/components/admin/marketplace/listing-form";
import { ListingStatusBadge } from "@/components/admin/marketplace/listing-status-badge";
import { Button } from "@/components/ui/button";
import { getLatestDiscordPublishLogForListing } from "@/lib/db/discord-publish-logs";
import { getDiscordMarketplaceConfig } from "@/lib/discord/env";
import { getMarketplaceListingById } from "@/lib/db/marketplace-listings";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const listing = await getMarketplaceListingById(id).catch(() => null);
  return {
    title: listing ? `Edit ${listing.title}` : "Edit listing",
  };
}

export default async function EditMarketplaceListingPage({ params }: PageProps) {
  const { id } = await params;

  let listing = null;
  try {
    listing = await getMarketplaceListingById(id);
  } catch {
    notFound();
  }

  if (!listing) {
    notFound();
  }

  const discordConfig = getDiscordMarketplaceConfig();
  let discordLatestLog = null;
  try {
    discordLatestLog = await getLatestDiscordPublishLogForListing(id);
  } catch {
    discordLatestLog = null;
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        render={<Link href="/admin/marketplace" />}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to marketplace
      </Button>

      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Edit listing
          </h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {listing.listingNumber}
          </p>
        </div>
        <ListingStatusBadge status={listing.status} />
      </div>

      <ListingForm
        mode="edit"
        listing={listing}
        siteUrl={discordConfig.siteUrl}
        discordWebhookConfigured={discordConfig.isConfigured}
        discordLatestLog={discordLatestLog}
        discordOwnerUserId={discordConfig.ownerUserId}
      />
    </div>
  );
}
