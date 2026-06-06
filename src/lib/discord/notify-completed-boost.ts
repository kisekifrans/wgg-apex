import "server-only";

import { buildCompletedBoostEmbed } from "@/lib/discord/build-completed-boost-embed";
import { getDiscordMarketplaceConfig } from "@/lib/discord/env";
import { isDiscordEmbeddableUrl } from "@/lib/discord/resolve-public-url";
import { sendDiscordWebhook } from "@/lib/discord/send-webhook";
import { getDiscordWebhookSettings } from "@/lib/db/app-settings";
import type { CompletedBoost } from "@/lib/db/completed-boosts";

export async function sendCompletedBoostToDiscord(
  boost: CompletedBoost
): Promise<{ success: boolean; error?: string }> {
  const settings = await getDiscordWebhookSettings();
  const { webhookUrl: marketplaceUrl, username, avatarUrl } =
    getDiscordMarketplaceConfig();

  const webhookUrl =
    settings.completedBoostsWebhookUrl ||
    settings.soldWebhookUrl ||
    marketplaceUrl;

  if (!webhookUrl) {
    return {
      success: false,
      error:
        "No Discord webhook configured. Set Completed boosts webhook in Content → Discord webhooks.",
    };
  }

  const payload = buildCompletedBoostEmbed({
    serviceType: boost.serviceType,
    fromRank: boost.fromRank,
    toRank: boost.toRank,
    description: boost.description,
    screenshotUrl: boost.screenshotPath,
    completedAt: boost.completedAt,
  });

  payload.username = username;
  if (isDiscordEmbeddableUrl(avatarUrl)) {
    payload.avatar_url = avatarUrl;
  }

  const result = await sendDiscordWebhook(payload, webhookUrl);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}
