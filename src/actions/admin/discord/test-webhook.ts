"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { DISCORD_EMBED_COLOR } from "@/lib/discord/constants";
import { getDiscordMarketplaceConfig } from "@/lib/discord/env";
import { sendDiscordWebhook } from "@/lib/discord/send-webhook";
import { siteConfig } from "@/config/site";

export type ActionResult = { success: true } | { success: false; error: string };

export async function sendDiscordTestMessage(): Promise<ActionResult> {
  await requireAdmin();

  const config = getDiscordMarketplaceConfig();
  if (!config.webhookUrl) {
    return {
      success: false,
      error: "Set DISCORD_MARKETPLACE_WEBHOOK_URL in your environment first.",
    };
  }

  const result = await sendDiscordWebhook(
    {
      username: config.username,
      avatar_url: config.avatarUrl,
      embeds: [
        {
          title: "WGG Apex — webhook test",
          description:
            "Marketplace publishing is connected. Use **Publish to Discord** on a listing to post account embeds.",
          color: DISCORD_EMBED_COLOR,
          url: config.siteUrl,
          footer: { text: `${siteConfig.name} · Discord Tools` },
          timestamp: new Date().toISOString(),
        },
      ],
    },
    config.webhookUrl
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}
