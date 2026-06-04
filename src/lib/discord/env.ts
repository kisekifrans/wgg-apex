import "server-only";

import { brandAssets } from "@/config/brand-assets";
import { siteConfig } from "@/config/site";
import { DISCORD_WEBHOOK_USERNAME_DEFAULT } from "@/lib/discord/constants";

export function getDiscordMarketplaceConfig() {
  const webhookUrl = process.env.DISCORD_MARKETPLACE_WEBHOOK_URL?.trim();
  const username =
    process.env.DISCORD_WEBHOOK_USERNAME?.trim() ||
    DISCORD_WEBHOOK_USERNAME_DEFAULT;
  const siteUrl = siteConfig.url.replace(/\/$/, "");
  const avatarUrl =
    process.env.DISCORD_WEBHOOK_AVATAR_URL?.trim() ||
    `${siteUrl}${brandAssets.logo}`;

  return {
    isConfigured: Boolean(webhookUrl),
    webhookUrl: webhookUrl ?? null,
    username,
    avatarUrl,
    siteUrl,
    cooldownSeconds: Number(
      process.env.DISCORD_PUBLISH_COOLDOWN_SECONDS ?? "300"
    ),
  };
}

export function maskWebhookUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    if (parts.length >= 2) {
      const token = parts[parts.length - 1];
      return `${parsed.origin}${parts.slice(0, -1).join("/")}/${token.slice(0, 6)}…`;
    }
  } catch {
    return "***";
  }
  return "***";
}
