import "server-only";

import { generateOrderNumber } from "@/lib/orders/order-number";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ServiceOrderType } from "@/types/orders";

type CheckoutRow = {
  id: string;
  checkout_kind: ServiceOrderType;
  customer_discord: string;
  customer_email: string | null;
  current_rank: string | null;
  target_rank: string | null;
  notes: string | null;
  service_detail: string | null;
  amount_cents: number;
  currency: string;
  marketplace_listing_id: string | null;
  pricing_item_id: string | null;
  line_item_name: string;
  payload?: {
    unbanDetails?: Record<string, string | null> | null;
  } | null;
};

export async function fulfillCheckoutAsOrder(
  checkout: CheckoutRow
): Promise<{ orderId: string; orderNumber: string }> {
  const supabase = createAdminClient();
  const orderNumber = await generateOrderNumber();

  const { data: order, error } = await supabase
    .from("service_orders")
    .insert({
      order_number: orderNumber,
      order_type: checkout.checkout_kind,
      customer_discord: checkout.customer_discord,
      customer_email: checkout.customer_email,
      current_rank: checkout.current_rank,
      target_rank: checkout.target_rank,
      service_detail: checkout.service_detail,
      notes: checkout.notes,
      status: "paid",
      payment_status: "paid",
      amount_cents: checkout.amount_cents,
      currency: checkout.currency,
      stripe_checkout_id: checkout.id,
      metadata: {
        unban: checkout.payload?.unbanDetails ?? null,
      },
      completed_at: null,
      cancelled_at: null,
    })
    .select("id, order_number")
    .single();

  if (error || !order) {
    throw new Error(error?.message ?? "Failed to create order");
  }

  if (checkout.marketplace_listing_id) {
    const { error: listingError } = await supabase
      .from("marketplace_listings")
      .update({
        status: "sold",
        sold_at: new Date().toISOString(),
      })
      .eq("id", checkout.marketplace_listing_id)
      .in("status", ["available", "reserved"]);

    if (listingError) {
      throw new Error(listingError.message);
    }
  }

  const { error: linkError } = await supabase
    .from("stripe_checkouts")
    .update({
      status: "completed",
      service_order_id: order.id,
      completed_at: new Date().toISOString(),
    })
    .eq("id", checkout.id);

  if (linkError) {
    throw new Error(linkError.message);
  }

  return { orderId: order.id, orderNumber: order.order_number };
}
