import "server-only";

import { fulfillCheckoutAsOrder } from "@/lib/checkout/fulfill-order";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CheckoutKind } from "@/types/checkout";

type CheckoutRow = {
  id: string;
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
  promo_code_id: string | null;
  discount_cents: number;
  service_order_id: string | null;
  paypal_order_id: string | null;
  payload: {
    unbanDetails?: Record<string, string | null> | null;
    predatorDetails?: Record<string, string | null> | null;
    relinkingDetails?: Record<string, string | null> | null;
  } | null;
};

async function loadCheckout(
  checkoutId: string
): Promise<CheckoutRow | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("stripe_checkouts")
    .select("*")
    .eq("id", checkoutId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as CheckoutRow | null;
}

async function claimCheckoutForFulfillment(
  checkoutId: string,
  opts: {
    paypalOrderId?: string | null;
    paypalCaptureId?: string | null;
  }
): Promise<CheckoutRow | null> {
  const supabase = createAdminClient();

  const { data: claimed, error } = await supabase
    .from("stripe_checkouts")
    .update({
      status: "processing",
      paypal_order_id: opts.paypalOrderId ?? undefined,
      paypal_capture_id: opts.paypalCaptureId ?? undefined,
    })
    .eq("id", checkoutId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (claimed) {
    return claimed as CheckoutRow;
  }

  const existing = await loadCheckout(checkoutId);
  if (!existing) {
    throw new Error(`Checkout record not found: ${checkoutId}`);
  }

  if (existing.status === "completed" && existing.service_order_id) {
    return null;
  }

  if (existing.status === "processing") {
    return null;
  }

  throw new Error(`Checkout ${checkoutId} is not eligible for fulfillment`);
}

export async function completePaidCheckout(
  checkoutId: string,
  opts: {
    paidCents: number;
    currency: string;
    paypalOrderId?: string | null;
    paypalCaptureId?: string | null;
  }
): Promise<void> {
  const preview = await loadCheckout(checkoutId);
  if (!preview) {
    throw new Error(`Checkout record not found: ${checkoutId}`);
  }

  if (preview.status === "completed" && preview.service_order_id) {
    return;
  }

  if (opts.paidCents !== preview.amount_cents) {
    throw new Error(
      `Amount mismatch: expected ${preview.amount_cents}, got ${opts.paidCents}`
    );
  }

  if (opts.currency.toUpperCase() !== preview.currency.toUpperCase()) {
    throw new Error("Currency mismatch");
  }

  if (
    opts.paypalOrderId &&
    preview.paypal_order_id &&
    preview.paypal_order_id !== opts.paypalOrderId
  ) {
    throw new Error("PayPal order ID does not match checkout");
  }

  const row = await claimCheckoutForFulfillment(checkoutId, {
    paypalOrderId: opts.paypalOrderId ?? preview.paypal_order_id,
    paypalCaptureId: opts.paypalCaptureId,
  });

  if (!row) {
    return;
  }

  try {
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
      promo_code_id: row.promo_code_id,
      discount_cents: row.discount_cents,
      payload: row.payload,
    });
  } catch (err) {
    const supabase = createAdminClient();
    await supabase
      .from("stripe_checkouts")
      .update({ status: "failed" })
      .eq("id", checkoutId)
      .eq("status", "processing");

    throw err;
  }
}
