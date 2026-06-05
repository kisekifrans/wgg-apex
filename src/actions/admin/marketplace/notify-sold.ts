"use server";

import {
  buildSoldListingEmbed,
  type SoldListingEmbedOptions,
} from "@/lib/discord/build-sold-embed";
import { sendDiscordWebhook } from "@/lib/discord/send-webhook";
import { getDiscordWebhookSettings } from "@/lib/db/app-settings";
import { getMarketplaceListingById } from "@/lib/db/marketplace-listings";

export async function notifyMarketplaceSold(
  listingId: string,
  options: SoldListingEmbedOptions = {}
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

  if (listing.status !== "sold") {
    return { success: false, error: "Listing is not marked sold" };
  }

  const payload = buildSoldListingEmbed(listing, options);
  const result = await sendDiscordWebhook(payload, webhookUrl);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true };
}
