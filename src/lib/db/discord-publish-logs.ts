import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { DISCORD_WEBHOOK_KEY_MARKETPLACE } from "@/lib/discord/constants";

export type DiscordPublishLog = {
  id: string;
  listingId: string;
  publishedBy: string;
  webhookKey: string;
  status: "success" | "failed";
  discordMessageId: string | null;
  discordChannelId: string | null;
  errorMessage: string | null;
  createdAt: string;
  listingNumber?: string;
  listingTitle?: string;
};

type LogRow = {
  id: string;
  listing_id: string;
  published_by: string;
  webhook_key: string;
  status: string;
  discord_message_id: string | null;
  discord_channel_id: string | null;
  error_message: string | null;
  created_at: string;
  marketplace_listings?: { listing_number: string; title: string } | null;
};

function mapLog(row: LogRow): DiscordPublishLog {
  return {
    id: row.id,
    listingId: row.listing_id,
    publishedBy: row.published_by,
    webhookKey: row.webhook_key,
    status: row.status as "success" | "failed",
    discordMessageId: row.discord_message_id,
    discordChannelId: row.discord_channel_id,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    listingNumber: row.marketplace_listings?.listing_number,
    listingTitle: row.marketplace_listings?.title,
  };
}

export async function insertDiscordPublishLog(input: {
  listingId: string;
  publishedBy: string;
  status: "success" | "failed";
  discordMessageId?: string | null;
  discordChannelId?: string | null;
  requestPayload: Record<string, unknown>;
  responsePayload?: Record<string, unknown> | null;
  errorMessage?: string | null;
}): Promise<string> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("discord_publish_logs")
    .insert({
      listing_id: input.listingId,
      published_by: input.publishedBy,
      webhook_key: DISCORD_WEBHOOK_KEY_MARKETPLACE,
      status: input.status,
      discord_message_id: input.discordMessageId ?? null,
      discord_channel_id: input.discordChannelId ?? null,
      request_payload: input.requestPayload,
      response_payload: input.responsePayload ?? null,
      error_message: input.errorMessage ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to write publish log");
  }

  return data.id;
}

export async function getLatestDiscordPublishLogForListing(
  listingId: string
): Promise<DiscordPublishLog | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("discord_publish_logs")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapLog(data as LogRow);
}

export async function getRecentDiscordPublishLogs(
  limit = 20
): Promise<DiscordPublishLog[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("discord_publish_logs")
    .select(
      "*, marketplace_listings ( listing_number, title )"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return ((data as LogRow[]) ?? []).map(mapLog);
}

export async function getLastSuccessfulPublishAt(
  listingId: string
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("discord_publish_logs")
    .select("created_at")
    .eq("listing_id", listingId)
    .eq("status", "success")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data?.created_at ?? null;
}
