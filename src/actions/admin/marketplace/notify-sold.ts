"use server";

import { buildSoldListingEmbed } from "@/lib/discord/build-sold-embed";
import { sendDiscordWebhook } from "@/lib/discord/send-webhook";
import { getDiscordWebhookSettings } from "@/lib/db/app-settings";
import { getMarketplaceListingById } from "@/lib/db/marketplace-listings";

export async function notifyMarketplaceSold(
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  const settings = await getDiscordWebhookSettings();
  const webhookUrl = settings.soldWebhookUrl;

  if (!webhookUrl) {
    return { success: true };
  }

  const listing = await getMarketplaceListingById(listingId);
  if (!listing) {
    return { success: false, error: "Listing not found" };
  }

  const payload = buildSoldListingEmbed(listing);
  const result = await sendDiscordWebhook(payload, webhookUrl);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}
