import "server-only";

import { releaseMarketplaceListingReservation } from "@/lib/checkout/marketplace-reservation";
import { createAdminClient } from "@/lib/supabase/admin";

type CheckoutRefundRow = {
  id: string;
  service_order_id: string | null;
  marketplace_listing_id: string | null;
  status: string;
  amount_cents: number;
};

type PayPalRefundResource = {
  id?: string;
  amount?: { value?: string; currency_code?: string };
  supplementary_data?: {
    related_ids?: { order_id?: string };
  };
};

export async function handlePayPalCaptureRefunded(
  resource: PayPalRefundResource
): Promise<void> {
  const captureId = resource.id;
  if (!captureId) return;

  const supabase = createAdminClient();

  const { data: checkout, error } = await supabase
    .from("stripe_checkouts")
    .select("id, service_order_id, marketplace_listing_id, status, amount_cents")
    .eq("paypal_capture_id", captureId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!checkout) {
    console.warn("[paypal refund] No checkout for capture", captureId);
    return;
  }

  const row = checkout as CheckoutRefundRow;
  const refundedCents = resource.amount?.value
    ? Math.round(parseFloat(resource.amount.value) * 100)
    : row.amount_cents;
  const isFullRefund = refundedCents >= row.amount_cents;

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
          paypalRefund: {
            captureId,
            amountRefunded: refundedCents,
            currency: resource.amount?.currency_code ?? "USD",
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

export async function handlePayPalOrderVoided(
  orderId: string
): Promise<void> {
  const supabase = createAdminClient();

  const { data: checkout } = await supabase
    .from("stripe_checkouts")
    .select("id, marketplace_listing_id, status")
    .eq("paypal_order_id", orderId)
    .maybeSingle();

  if (!checkout || checkout.status !== "pending") {
    return;
  }

  await supabase
    .from("stripe_checkouts")
    .update({ status: "expired" })
    .eq("id", checkout.id)
    .eq("status", "pending");

  if (checkout.marketplace_listing_id) {
    await releaseMarketplaceListingReservation(checkout.marketplace_listing_id);
  }
}
