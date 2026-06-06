import { brandAssets } from "@/config/brand-assets";
import { formatRankLabelForDiscord } from "@/config/discord-rank-emojis";
import {
  DISCORD_EMBED_LIMITS,
  DISCORD_WEBHOOK_USERNAME_DEFAULT,
} from "@/lib/discord/constants";
import type { DiscordWebhookPayload } from "@/lib/discord/types";
import { formatListingPrice } from "@/lib/marketplace/format";
import { getSiteUrl } from "@/lib/site-url";
import {
  MARKETPLACE_PLATFORMS,
  type MarketplaceListing,
} from "@/types/marketplace";

/** Red accent for sold listings */
const DISCORD_SOLD_EMBED_COLOR = 0xdc2626;

export type SoldListingEmbedOptions = {
  orderNumber?: string;
  soldVia?: "checkout" | "admin";
};

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function platformLabel(platform: MarketplaceListing["platform"]): string {
  return (
    MARKETPLACE_PLATFORMS.find((p) => p.value === platform)?.label ?? platform
  );
}

function formatSoldDate(soldAt: string | null): string {
  if (!soldAt) return "Just now";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(soldAt));
}

function resolveListingImageUrl(
  listing: MarketplaceListing,
  siteUrl: string
): string | undefined {
  const raw = listing.images[0]?.publicUrl;
  if (!raw) return undefined;
  if (raw.startsWith("http")) return raw;
  return `${siteUrl}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

export function buildSoldListingEmbed(
  listing: MarketplaceListing,
  options: SoldListingEmbedOptions = {}
): DiscordWebhookPayload {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const listingUrl = `${siteUrl}/marketplace/${encodeURIComponent(listing.listingNumber)}`;
  const price = formatListingPrice(listing.priceCents, listing.currency);
  const soldDate = formatSoldDate(listing.soldAt);
  const imageUrl = resolveListingImageUrl(listing, siteUrl);

  const descriptionParts = [
    "**This account has been sold and is no longer available for purchase.**",
    "",
    `**${listing.title}**`,
  ];

  if (listing.description?.trim()) {
    descriptionParts.push("", truncate(listing.description.trim(), 500));
  }

  const fields = [
    { name: "Status", value: "**SOLD**", inline: true },
    { name: "Listing ID", value: listing.listingNumber, inline: true },
    { name: "Sale Price", value: price, inline: true },
    {
      name: "Rank",
      value: truncate(formatRankLabelForDiscord(listing.rankLabel), 1024),
      inline: true,
    },
    { name: "Platform", value: platformLabel(listing.platform), inline: true },
    {
      name: "Heirlooms",
      value: String(listing.heirloomCount),
      inline: true,
    },
    {
      name: "Legendary Skins",
      value: String(listing.ballerCount),
      inline: true,
    },
    { name: "Sold On", value: `${soldDate} UTC`, inline: true },
  ];

  if (listing.rpLabel?.trim()) {
    fields.push({
      name: "RP",
      value: truncate(listing.rpLabel.trim(), 1024),
      inline: true,
    });
  }

  if (options.orderNumber) {
    fields.push({
      name: "Order",
      value: options.orderNumber,
      inline: true,
    });
  }

  fields.push({
    name: "Sold Via",
    value: options.soldVia === "checkout" ? "Website checkout" : "WGG Apex",
    inline: true,
  });

  if (listing.tags.length > 0) {
    fields.push({
      name: "Tags",
      value: truncate(listing.tags.join(", "), 1024),
      inline: false,
    });
  }

  fields.push({
    name: "Listing Page",
    value: listingUrl,
    inline: false,
  });

  const avatarUrl = siteUrl.startsWith("http")
    ? `${siteUrl}${brandAssets.logo}`
    : undefined;

  return {
    content: `🔴 **SOLD** — ${listing.listingNumber} (${price})`,
    username:
      process.env.DISCORD_WEBHOOK_USERNAME?.trim() ||
      DISCORD_WEBHOOK_USERNAME_DEFAULT,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    embeds: [
      {
        title: truncate(`SOLD — ${listing.title}`, DISCORD_EMBED_LIMITS.title),
        url: listingUrl,
        description: truncate(
          descriptionParts.join("\n"),
          DISCORD_EMBED_LIMITS.description
        ),
        color: DISCORD_SOLD_EMBED_COLOR,
        fields,
        image: imageUrl ? { url: imageUrl } : undefined,
        footer: { text: `WGG Apex Marketplace · ${listing.listingNumber}` },
        timestamp: listing.soldAt ?? new Date().toISOString(),
      },
    ],
  };
}
