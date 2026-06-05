import "server-only";

import { buildNewOrderEmbed } from "@/lib/discord/build-new-order-embed";
import { DISCORD_OWNER_USER_ID_DEFAULT } from "@/lib/discord/constants";
import { getDiscordMarketplaceConfig } from "@/lib/discord/env";
import { sendDiscordWebhook } from "@/lib/discord/send-webhook";
import { getDiscordWebhookSettings } from "@/lib/db/app-settings";
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
};

/** Posts a new paid order to the configured Discord orders webhook. */
export async function sendNewOrderNotification(
  input: NewOrderNotificationInput
): Promise<{ success: boolean; error?: string }> {
  const settings = await getDiscordWebhookSettings();
  const webhookUrl = settings.ordersWebhookUrl;

  if (!webhookUrl) {
    return { success: true };
  }

  const { ownerUserId, username, avatarUrl } = getDiscordMarketplaceConfig();

  const payload = buildNewOrderEmbed({
    ...input,
    ownerUserId: ownerUserId || DISCORD_OWNER_USER_ID_DEFAULT,
  });

  payload.username = username;
  payload.avatar_url = avatarUrl;

  const result = await sendDiscordWebhook(payload, webhookUrl);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}
