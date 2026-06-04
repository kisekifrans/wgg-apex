import { brandAssets } from "@/config/brand-assets";
import {
  DISCORD_EMBED_COLOR,
  DISCORD_EMBED_LIMITS,
  DISCORD_OWNER_USER_ID_DEFAULT,
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
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
  };
  return labels[status] ?? status;
}

function buildListingBody(listing: MarketplaceListing): string {
  const trimmed = listing.description?.trim();
  if (trimmed) {
    return trimmed;
  }

  const platform = platformLabel(listing.platform);
  const heirlooms =
    listing.heirloomCount === 1
      ? "1 heirloom"
      : `${listing.heirloomCount} heirlooms`;
  const ballers =
    listing.ballerCount === 1
      ? "1 legendary skin"
      : `${listing.ballerCount} legendary skins`;

  return `${listing.rankLabel} account on ${platform}. ${heirlooms}. ${ballers} (Baller). Verified WGG Apex listing.`;
}

function buildPurchaseFields(
  listingUrl: string,
  ownerUserId: string
): { name: string; value: string; inline: boolean }[] {
  return [
    {
      name: "Buy on website",
      value: `Click here to purchase:\n${listingUrl}`,
      inline: false,
    },
    {
      name: "Buy on Discord",
      value: `DM <@${ownerUserId}> (owner) to purchase this account.`,
      inline: false,
    },
  ];
}

export type BuildMarketplaceEmbedOptions = {
  siteUrl: string;
  username?: string;
  avatarUrl?: string;
  ownerUserId?: string;
};

export function buildMarketplaceEmbed(
  listing: MarketplaceListing,
  options: BuildMarketplaceEmbedOptions
): DiscordWebhookPayload {
  const siteUrl = options.siteUrl.replace(/\/$/, "");
  const listingUrl = `${siteUrl}/marketplace/${listing.id}`;
  const ownerUserId = options.ownerUserId ?? DISCORD_OWNER_USER_ID_DEFAULT;
  const price = formatListingPrice(listing.priceCents, listing.currency);
  const title = truncate(`${listing.title} — ${price}`, DISCORD_EMBED_LIMITS.title);

  const body = buildListingBody(listing);
  const isAvailable = listing.status === "available";

  const descriptionParts = [body];
  if (isAvailable) {
    descriptionParts.push(
      "",
      "**Status: Available**",
      "Choose either purchase option below."
    );
  }

  const description = truncate(
    descriptionParts.join("\n"),
    DISCORD_EMBED_LIMITS.description
  );

  const fields = [
    { name: "Rank", value: truncate(listing.rankLabel, 1024), inline: true },
    { name: "Platform", value: platformLabel(listing.platform), inline: true },
    {
      name: "Heirlooms",
      value: String(listing.heirloomCount),
      inline: true,
    },
    {
      name: "Baller",
      value: String(listing.ballerCount),
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

  if (isAvailable) {
    fields.push(...buildPurchaseFields(listingUrl, ownerUserId));
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
    description,
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
