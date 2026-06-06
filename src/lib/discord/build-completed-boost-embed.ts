import "server-only";

import { DISCORD_EMBED_COLOR, DISCORD_EMBED_LIMITS } from "@/lib/discord/constants";
import { resolveDiscordPublicUrl } from "@/lib/discord/resolve-public-url";
import type { DiscordWebhookPayload } from "@/lib/discord/types";
import { getSiteUrl } from "@/lib/site-url";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export type CompletedBoostEmbedInput = {
  serviceType: string;
  fromRank: string;
  toRank: string;
  description: string | null;
  screenshotUrl: string;
  completedAt: string;
};

function formatCompletedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function buildCompletedBoostEmbed(
  input: CompletedBoostEmbedInput
): DiscordWebhookPayload {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const imageUrl = resolveDiscordPublicUrl(input.screenshotUrl);
  const completedDate = new Date(input.completedAt);
  const timestamp = Number.isNaN(completedDate.getTime())
    ? new Date().toISOString()
    : completedDate.toISOString();

  const embed: DiscordWebhookPayload["embeds"][number] = {
    title: truncate(
      `Boost completed — ${input.serviceType}`,
      DISCORD_EMBED_LIMITS.title
    ),
    url: `${siteUrl}/#completed-boosts`,
    color: DISCORD_EMBED_COLOR,
    fields: [
      {
        name: "Service",
        value: truncate(input.serviceType, DISCORD_EMBED_LIMITS.fieldValue),
        inline: true,
      },
      {
        name: "Rank climb",
        value: truncate(
          `${input.fromRank} → ${input.toRank}`,
          DISCORD_EMBED_LIMITS.fieldValue
        ),
        inline: true,
      },
      {
        name: "Completed",
        value: formatCompletedDate(input.completedAt),
        inline: true,
      },
    ],
    footer: { text: "WGG Apex · Completed boost" },
    timestamp,
  };

  const description = input.description?.trim();
  if (description) {
    embed.description = truncate(description, DISCORD_EMBED_LIMITS.description);
  }

  if (imageUrl) {
    embed.image = { url: imageUrl };
  }

  return { embeds: [embed] };
}
