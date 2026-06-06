import "server-only";

import {
  DISCORD_BOOSTING_SERVICES_CHANNEL_ID,
  DISCORD_OWNER_USER_ID_DEFAULT,
} from "@/lib/discord/constants";

export function buildDiscordServiceCta(
  siteUrl: string,
  ownerUserId: string = DISCORD_OWNER_USER_ID_DEFAULT
): string {
  const url = siteUrl.replace(/\/$/, "");

  return [
    "**Get our service now!**",
    `<#${DISCORD_BOOSTING_SERVICES_CHANNEL_ID}>`,
    `DM <@${ownerUserId}>`,
    `Order on [WGG Apex Website](${url})`,
  ].join("\n");
}
