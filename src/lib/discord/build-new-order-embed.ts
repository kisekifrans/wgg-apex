import "server-only";

import { formatRankLabelForDiscord } from "@/config/discord-rank-emojis";
import { DISCORD_EMBED_COLOR } from "@/lib/discord/constants";
import type { DiscordEmbedField, DiscordWebhookPayload } from "@/lib/discord/types";
import { formatPriceFromCents } from "@/lib/services/format-price";
import { getSiteUrl } from "@/lib/site-url";
import type { ServiceOrderType } from "@/types/orders";

export type NewOrderNotificationInput = {
  orderNumber: string;
  orderType: ServiceOrderType;
  serviceName: string;
  customerDiscord: string;
  customerEmail: string | null;
  amountCents: number;
  currency: string;
  currentRank: string | null;
  targetRank: string | null;
  serviceDetail: string | null;
  ownerUserId: string;
};

export function buildNewOrderEmbed(
  input: NewOrderNotificationInput
): DiscordWebhookPayload {
  const siteUrl = getSiteUrl();
  const fields: DiscordEmbedField[] = [
    { name: "Order", value: input.orderNumber, inline: true },
    { name: "Service", value: input.serviceName, inline: true },
    {
      name: "Total",
      value: formatPriceFromCents(input.amountCents) ?? "—",
      inline: true,
    },
    { name: "Discord", value: input.customerDiscord, inline: true },
    {
      name: "Email",
      value: input.customerEmail ?? "—",
      inline: true,
    },
  ];

  if (input.currentRank || input.targetRank) {
    fields.push({
      name: "Ranks",
      value:
        [input.currentRank, input.targetRank]
          .filter((v): v is string => Boolean(v))
          .map(formatRankLabelForDiscord)
          .join(" → ") || "—",
      inline: false,
    });
  }

  if (input.serviceDetail) {
    fields.push({
      name: "Details",
      value: input.serviceDetail,
      inline: false,
    });
  }

  return {
    content: `<@${input.ownerUserId}> New paid order`,
    allowed_mentions: { users: [input.ownerUserId] },
    embeds: [
      {
        title: "New order received",
        url: `${siteUrl}/admin/orders`,
        color: DISCORD_EMBED_COLOR,
        fields,
        footer: { text: "WGG Apex · Order notification" },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
