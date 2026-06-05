import { getSiteUrl } from "@/lib/site-url";
import type { MarketplaceListing } from "@/types/marketplace";
import { formatPriceFromCents } from "@/lib/services/format-price";

export function buildSoldListingEmbed(listing: MarketplaceListing) {
  const siteUrl = getSiteUrl();
  const imageUrl = listing.images[0]?.publicUrl
    ? listing.images[0].publicUrl.startsWith("http")
      ? listing.images[0].publicUrl
      : `${siteUrl}${listing.images[0].publicUrl}`
    : undefined;

  return {
    username: process.env.DISCORD_WEBHOOK_USERNAME?.trim() || "WGG Apex",
    embeds: [
      {
        title: `SOLD — ${listing.title}`,
        description: [
          `**Status:** SOLD`,
          `**Listing ID:** ${listing.listingNumber}`,
          `**Rank:** ${listing.rankLabel}`,
          `**Platform:** ${listing.platform}`,
          `**Price:** ${formatPriceFromCents(listing.priceCents)}`,
        ].join("\n"),
        color: 0xe85d04,
        image: imageUrl ? { url: imageUrl } : undefined,
        footer: { text: "WGG Apex Marketplace" },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
