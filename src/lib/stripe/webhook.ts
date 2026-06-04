import "server-only";

import type Stripe from "stripe";

import { fulfillCheckoutAsOrder } from "@/lib/checkout/fulfill-order";
import { releaseMarketplaceListingReservation } from "@/lib/checkout/marketplace-reservation";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CheckoutKind } from "@/types/checkout";

type CheckoutRow = {
  id: string;
  stripe_session_id: string | null;
  status: string;
  amount_cents: number;
  currency: string;
  checkout_kind: CheckoutKind;
  customer_discord: string;
  customer_email: string | null;
  current_rank: string | null;
  target_rank: string | null;
  notes: string | null;
  service_detail: string | null;
  marketplace_listing_id: string | null;
  pricing_item_id: string | null;
  line_item_name: string;
  service_order_id: string | null;
  payload: {
    unbanDetails?: Record<string, string | null> | null;
  } | null;
};

export type WebhookClaimResult =
  | { action: "process" }
  | { action: "skip"; reason: "already_completed" }
  | { action: "duplicate_in_flight" };

/** Claim event for processing; allows Stripe retries after failure. */
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

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const checkoutId = session.metadata?.checkout_id;
  if (!checkoutId) {
    throw new Error("Missing checkout_id in session metadata");
  }

  const supabase = createAdminClient();

  const { data: checkout, error } = await supabase
    .from("stripe_checkouts")
    .select("*")
    .eq("id", checkoutId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!checkout) {
    throw new Error(`Checkout record not found: ${checkoutId}`);
  }

  const row = checkout as CheckoutRow;

  if (row.status === "completed" && row.service_order_id) {
    return;
  }

  if (session.payment_status !== "paid") {
    throw new Error(`Session not paid: ${session.payment_status}`);
  }

  const paidCents = session.amount_total ?? 0;
  if (paidCents !== row.amount_cents) {
    throw new Error(
      `Amount mismatch: expected ${row.amount_cents}, got ${paidCents}`
    );
  }

  if (
    session.currency &&
    session.currency.toUpperCase() !== row.currency.toUpperCase()
  ) {
    throw new Error("Currency mismatch");
  }

  await supabase
    .from("stripe_checkouts")
    .update({
      stripe_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
    })
    .eq("id", checkoutId);

  await fulfillCheckoutAsOrder({
    id: row.id,
    checkout_kind: row.checkout_kind,
    customer_discord: row.customer_discord,
    customer_email: row.customer_email,
    current_rank: row.current_rank,
    target_rank: row.target_rank,
    notes: row.notes,
    service_detail: row.service_detail,
    amount_cents: row.amount_cents,
    currency: row.currency,
    marketplace_listing_id: row.marketplace_listing_id,
    pricing_item_id: row.pricing_item_id,
    line_item_name: row.line_item_name,
    payload: row.payload,
  });
}

export async function handleCheckoutSessionExpired(
  session: Stripe.Checkout.Session
): Promise<void> {
  const checkoutId = session.metadata?.checkout_id;
  if (!checkoutId) return;

  const supabase = createAdminClient();

  const { data: checkout } = await supabase
    .from("stripe_checkouts")
    .select("marketplace_listing_id, status")
    .eq("id", checkoutId)
    .maybeSingle();

  await supabase
    .from("stripe_checkouts")
    .update({ status: "expired" })
    .eq("id", checkoutId)
    .eq("status", "pending");

  if (checkout?.marketplace_listing_id) {
    await releaseMarketplaceListingReservation(checkout.marketplace_listing_id);
  }
}
