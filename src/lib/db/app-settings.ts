import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getAppSetting<T>(
  key: string,
  fallback: T
): Promise<T> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (error || !data?.value) return fallback;
  return data.value as T;
}

export async function setAppSetting(
  key: string,
  value: Record<string, unknown>
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("app_settings").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
}

export type DiscordWebhookSettings = {
  soldWebhookUrl?: string;
  ordersWebhookUrl?: string;
};

export async function getDiscordWebhookSettings(): Promise<DiscordWebhookSettings> {
  const soldEnvUrl = process.env.DISCORD_MARKETPLACE_SOLD_WEBHOOK_URL?.trim();
  const ordersEnvUrl = process.env.DISCORD_ORDERS_WEBHOOK_URL?.trim();
  const db = await getAppSetting<DiscordWebhookSettings>("discord_webhooks", {});
  return {
    soldWebhookUrl: db.soldWebhookUrl || soldEnvUrl || undefined,
    ordersWebhookUrl: db.ordersWebhookUrl || ordersEnvUrl || undefined,
  };
}
