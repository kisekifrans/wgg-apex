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
  service_order_id: string | null;
  payload: {
    unbanDetails?: Record<string, string | null> | null;
    predatorDetails?: Record<string, string | null> | null;
  } | null;
};

export async function completePaidCheckout(
  checkoutId: string,
  opts: {
    paidCents: number;
    currency: string;
    paypalOrderId?: string | null;
    paypalCaptureId?: string | null;
  }
): Promise<void> {
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

  if (opts.paidCents !== row.amount_cents) {
    throw new Error(
      `Amount mismatch: expected ${row.amount_cents}, got ${opts.paidCents}`
    );
  }

  if (opts.currency.toUpperCase() !== row.currency.toUpperCase()) {
    throw new Error("Currency mismatch");
  }

  await supabase
    .from("stripe_checkouts")
    .update({
      paypal_order_id: opts.paypalOrderId ?? null,
      paypal_capture_id: opts.paypalCaptureId ?? null,
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
