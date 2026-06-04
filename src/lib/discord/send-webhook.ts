import "server-only";

import type { DiscordWebhookPayload } from "@/lib/discord/types";

const DISCORD_FETCH_TIMEOUT_MS = 10_000;

export type DiscordWebhookResponse = {
  id: string;
  channel_id: string;
};

export async function sendDiscordWebhook(
  payload: DiscordWebhookPayload,
  webhookUrl: string
): Promise<
  | { success: true; message: DiscordWebhookResponse | null }
  | { success: false; error: string; status?: number }
> {
  if (!webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
    return { success: false, error: "Invalid Discord webhook URL." };
  }

  const url = webhookUrl.includes("?")
    ? `${webhookUrl}&wait=true`
    : `${webhookUrl}?wait=true`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DISCORD_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (response.status === 204) {
      return { success: true, message: null };
    }

    const bodyText = await response.text();
    let bodyJson: unknown = null;
    try {
      bodyJson = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      bodyJson = { raw: bodyText };
    }

    if (!response.ok) {
      const discordMessage =
        typeof bodyJson === "object" &&
        bodyJson !== null &&
        "message" in bodyJson &&
        typeof (bodyJson as { message: unknown }).message === "string"
          ? (bodyJson as { message: string }).message
          : `Discord returned ${response.status}`;

      if (response.status === 401 || response.status === 404) {
        return {
          success: false,
          error: "Webhook invalid or deleted — create a new webhook in Discord.",
          status: response.status,
        };
      }
      if (response.status === 429) {
        return {
          success: false,
          error: "Discord rate limit — wait a minute and try again.",
          status: response.status,
        };
      }

      return { success: false, error: discordMessage, status: response.status };
    }

    if (
      typeof bodyJson === "object" &&
      bodyJson !== null &&
      "id" in bodyJson &&
      "channel_id" in bodyJson
    ) {
      const msg = bodyJson as { id: string; channel_id: string };
      return {
        success: true,
        message: { id: msg.id, channel_id: msg.channel_id },
      };
    }

    return { success: true, message: null };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { success: false, error: "Discord request timed out." };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reach Discord.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
