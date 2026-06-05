"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { sendMarketplaceSoldNotification } from "@/lib/discord/notify-marketplace-sold";
import type { SoldListingEmbedOptions } from "@/lib/discord/build-sold-embed";

export async function notifyMarketplaceSold(
  listingId: string,
  options: SoldListingEmbedOptions = {}
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();
  return sendMarketplaceSoldNotification(listingId, options);
}
