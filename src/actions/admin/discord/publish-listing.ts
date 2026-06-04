"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import {
  buildMarketplaceEmbed,
  canPublishListingToDiscord,
} from "@/lib/discord/build-marketplace-embed";
import { getDiscordMarketplaceConfig } from "@/lib/discord/env";
import { sendDiscordWebhook } from "@/lib/discord/send-webhook";
import type { DiscordPublishResult } from "@/lib/discord/types";
import {
  getLastSuccessfulPublishAt,
  insertDiscordPublishLog,
} from "@/lib/db/discord-publish-logs";
import { getMarketplaceListingById } from "@/lib/db/marketplace-listings";
import { checkRateLimit } from "@/lib/security/rate-limit";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function publishListingToDiscord(
  listingId: string,
  options?: { force?: boolean }
): Promise<ActionResult<DiscordPublishResult>> {
  const admin = await requireAdmin();

  const rateLimit = checkRateLimit(`discord-publish:${admin.id}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!rateLimit.allowed) {
    return { success: false, error: "Too many publish attempts. Wait a moment." };
  }

  const config = getDiscordMarketplaceConfig();
  if (!config.webhookUrl) {
    return {
      success: false,
      error:
        "Discord webhook not configured. Set DISCORD_MARKETPLACE_WEBHOOK_URL in your environment.",
    };
  }

  const listing = await getMarketplaceListingById(listingId);
  if (!listing) {
    return { success: false, error: "Listing not found." };
  }

  const eligibility = canPublishListingToDiscord(listing);
  if (!eligibility.ok) {
    return { success: false, error: eligibility.reason };
  }

  if (!options?.force && config.cooldownSeconds > 0) {
    const lastAt = await getLastSuccessfulPublishAt(listingId);
    if (lastAt) {
      const elapsed = Date.now() - new Date(lastAt).getTime();
      if (elapsed < config.cooldownSeconds * 1000) {
        const mins = Math.ceil((config.cooldownSeconds * 1000 - elapsed) / 60_000);
        return {
          success: false,
          error: `Published recently. Wait ${mins} min or use force publish.`,
        };
      }
    }
  }

  const payload = buildMarketplaceEmbed(listing, {
    siteUrl: config.siteUrl,
    username: config.username,
    avatarUrl: config.avatarUrl,
    ownerUserId: config.ownerUserId,
  });

  const sendResult = await sendDiscordWebhook(payload, config.webhookUrl);

  const logId = await insertDiscordPublishLog({
    listingId,
    publishedBy: admin.id,
    status: sendResult.success ? "success" : "failed",
    discordMessageId: sendResult.success ? sendResult.message?.id ?? null : null,
    discordChannelId: sendResult.success
      ? sendResult.message?.channel_id ?? null
      : null,
    requestPayload: payload as unknown as Record<string, unknown>,
    responsePayload: sendResult.success
      ? (sendResult.message as unknown as Record<string, unknown>) ?? null
      : { error: sendResult.error, status: sendResult.status },
    errorMessage: sendResult.success ? null : sendResult.error,
  });

  revalidatePath(`/admin/marketplace/${listingId}`);
  revalidatePath("/admin/discord");
  revalidatePath("/admin/marketplace");

  if (!sendResult.success) {
    return { success: false, error: sendResult.error };
  }

  return {
    success: true,
    data: {
      logId,
      messageId: sendResult.message?.id ?? null,
      channelId: sendResult.message?.channel_id ?? null,
    },
  };
}
