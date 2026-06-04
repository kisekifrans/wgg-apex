import "server-only";

import type Stripe from "stripe";

import { releaseMarketplaceListingReservation } from "@/lib/checkout/marketplace-reservation";
import { createAdminClient } from "@/lib/supabase/admin";

type CheckoutRefundRow = {
  id: string;
  service_order_id: string | null;
  marketplace_listing_id: string | null;
  status: string;
  amount_cents: number;
};

export async function handleChargeRefunded(
  charge: Stripe.Charge
): Promise<void> {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    return;
  }

  const supabase = createAdminClient();

  const { data: checkout, error } = await supabase
    .from("stripe_checkouts")
    .select("id, service_order_id, marketplace_listing_id, status, amount_cents")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!checkout) {
    console.warn(
      "[stripe refund] No checkout for payment_intent",
      paymentIntentId
    );
    return;
  }

  const row = checkout as CheckoutRefundRow;
  const isFullRefund =
    charge.refunded ||
    charge.amount_refunded >= charge.amount ||
    charge.amount_refunded >= row.amount_cents;

  if (row.service_order_id) {
    const { data: order } = await supabase
      .from("service_orders")
      .select("metadata")
      .eq("id", row.service_order_id)
      .maybeSingle();

    const priorMeta =
      order?.metadata && typeof order.metadata === "object"
        ? (order.metadata as Record<string, unknown>)
        : {};

    const { error: orderError } = await supabase
      .from("service_orders")
      .update({
        payment_status: "refunded",
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        metadata: {
          ...priorMeta,
          stripeRefund: {
            chargeId: charge.id,
            amountRefunded: charge.amount_refunded,
            currency: charge.currency,
            fullRefund: isFullRefund,
            refundedAt: new Date().toISOString(),
          },
        },
      })
      .eq("id", row.service_order_id);

    if (orderError) {
      throw new Error(orderError.message);
    }
  }

  if (row.status !== "refunded") {
    const { error: checkoutError } = await supabase
      .from("stripe_checkouts")
      .update({ status: "refunded" })
      .eq("id", row.id);

    if (checkoutError) {
      throw new Error(checkoutError.message);
    }
  }

  if (isFullRefund && row.marketplace_listing_id) {
    await supabase
      .from("marketplace_listings")
      .update({
        status: "available",
        sold_at: null,
      })
      .eq("id", row.marketplace_listing_id)
      .eq("status", "sold");
  }
}

export async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const supabase = createAdminClient();

  const { data: checkout, error } = await supabase
    .from("stripe_checkouts")
    .select("id, marketplace_listing_id, status")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!checkout || checkout.status !== "pending") {
    return;
  }

  await supabase
    .from("stripe_checkouts")
    .update({ status: "failed" })
    .eq("id", checkout.id)
    .eq("status", "pending");

  if (checkout.marketplace_listing_id) {
    await releaseMarketplaceListingReservation(
      checkout.marketplace_listing_id
    );
  }
}
