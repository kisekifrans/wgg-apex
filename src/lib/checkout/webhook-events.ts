import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type WebhookClaimResult =
  | { action: "process" }
  | { action: "skip"; reason: "already_completed" }
  | { action: "duplicate_in_flight" };

export async function claimWebhookEvent(
  eventId: string,
  eventType: string
): Promise<WebhookClaimResult> {
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("stripe_webhook_events")
    .select("status")
    .eq("stripe_event_id", eventId)
    .maybeSingle();

  if (existing?.status === "completed") {
    return { action: "skip", reason: "already_completed" };
  }

  if (existing?.status === "processing") {
    return { action: "duplicate_in_flight" };
  }

  if (existing) {
    const { error } = await supabase
      .from("stripe_webhook_events")
      .update({ status: "processing", error_message: null })
      .eq("stripe_event_id", eventId);

    if (error) throw new Error(error.message);
    return { action: "process" };
  }

  const { error } = await supabase.from("stripe_webhook_events").insert({
    stripe_event_id: eventId,
    event_type: eventType,
    status: "processing",
  });

  if (error?.code === "23505") {
    return { action: "duplicate_in_flight" };
  }

  if (error) throw new Error(error.message);

  return { action: "process" };
}

export async function completeWebhookEvent(eventId: string): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("stripe_webhook_events")
    .update({
      status: "completed",
      processed_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("stripe_event_id", eventId);

  if (error) throw new Error(error.message);
}

export async function failWebhookEvent(
  eventId: string,
  message: string
): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from("stripe_webhook_events")
    .update({
      status: "failed",
      error_message: message.slice(0, 500),
    })
    .eq("stripe_event_id", eventId);
}
