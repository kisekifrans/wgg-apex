import { brandAssets } from "@/config/brand-assets";
import {
  DISCORD_EMBED_COLOR,
  DISCORD_EMBED_LIMITS,
  DISCORD_WEBHOOK_USERNAME_DEFAULT,
} from "@/lib/discord/constants";
import type { DiscordWebhookPayload } from "@/lib/discord/types";
import { formatListingPrice } from "@/lib/marketplace/format";
import { MARKETPLACE_PLATFORMS, type MarketplaceListing } from "@/types/marketplace";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function platformLabel(platform: MarketplaceListing["platform"]): string {
  return (
    MARKETPLACE_PLATFORMS.find((p) => p.value === platform)?.label ?? platform
  );
}

function statusLabel(status: MarketplaceListing["status"]): string {
  const labels: Record<MarketplaceListing["status"], string> = {
    draft: "Draft",
    available: "Available — Inquire to purchase",
    reserved: "Reserved",
    sold: "Sold",
  };
  return labels[status] ?? status;
}

function buildDescription(listing: MarketplaceListing): string {
  const trimmed = listing.description?.trim();
  if (trimmed) {
    return truncate(trimmed, DISCORD_EMBED_LIMITS.description);
  }

  const platform = platformLabel(listing.platform);
  const heirlooms =
    listing.heirloomCount === 1
      ? "1 heirloom"
      : `${listing.heirloomCount} heirlooms`;

  return `${listing.rankLabel} account on ${platform}. ${heirlooms}. Verified WGG Apex listing.`;
}

export type BuildMarketplaceEmbedOptions = {
  siteUrl: string;
  username?: string;
  avatarUrl?: string;
};

export function buildMarketplaceEmbed(
  listing: MarketplaceListing,
  options: BuildMarketplaceEmbedOptions
): DiscordWebhookPayload {
  const siteUrl = options.siteUrl.replace(/\/$/, "");
  const listingUrl = `${siteUrl}/marketplace/${listing.id}`;
  const price = formatListingPrice(listing.priceCents, listing.currency);
  const title = truncate(`${listing.title} — ${price}`, DISCORD_EMBED_LIMITS.title);

  const fields = [
    { name: "Rank", value: truncate(listing.rankLabel, 1024), inline: true },
    { name: "Platform", value: platformLabel(listing.platform), inline: true },
    {
      name: "Heirlooms",
      value: String(listing.heirloomCount),
      inline: true,
    },
    { name: "Status", value: statusLabel(listing.status), inline: true },
  ];

  if (listing.rpLabel?.trim()) {
    fields.push({
      name: "RP",
      value: truncate(listing.rpLabel.trim(), 1024),
      inline: true,
    });
  }

  if (listing.tags.length > 0) {
    fields.push({
      name: "Tags",
      value: truncate(listing.tags.join(", "), 1024),
      inline: false,
    });
  }

  const primaryImage = listing.images[0]?.publicUrl;
  const embed = {
    title,
    url: listingUrl,
    description: buildDescription(listing),
    color: DISCORD_EMBED_COLOR,
    fields,
    footer: { text: `WGG Apex · ${listing.listingNumber}` },
    timestamp: new Date().toISOString(),
    ...(primaryImage?.startsWith("https://")
      ? { image: { url: primaryImage } }
      : {}),
  };

  const avatarUrl =
    options.avatarUrl ??
    (siteUrl.startsWith("http") ? `${siteUrl}${brandAssets.logo}` : undefined);

  return {
    username: options.username ?? DISCORD_WEBHOOK_USERNAME_DEFAULT,
    ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    embeds: [embed],
  };
}

/** Whether listing can be published to Discord */
export function canPublishListingToDiscord(
  listing: MarketplaceListing
): { ok: true } | { ok: false; reason: string } {
  if (listing.status === "draft") {
    return {
      ok: false,
      reason: "Set status to Available, Reserved, or Sold before publishing.",
    };
  }
  return { ok: true };
}
