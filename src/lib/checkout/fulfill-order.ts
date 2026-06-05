import "server-only";

import { sendMarketplaceSoldNotification } from "@/lib/discord/notify-marketplace-sold";
import { sendOrderConfirmationEmail } from "@/lib/email/send-order-confirmation";
import { generateOrderNumber } from "@/lib/orders/order-number";
import { progressPercentForStatus } from "@/lib/orders/progress";
import { recordOrderStatusUpdate } from "@/lib/orders/status-updates";
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
    predatorDetails?: Record<string, string | null> | null;
  } | null;
};

export async function fulfillCheckoutAsOrder(
  checkout: CheckoutRow
): Promise<{ orderId: string; orderNumber: string }> {
  const supabase = createAdminClient();

  const { data: existingOrder } = await supabase
    .from("service_orders")
    .select("id, order_number")
    .eq("stripe_checkout_id", checkout.id)
    .maybeSingle();

  if (existingOrder) {
    await supabase
      .from("stripe_checkouts")
      .update({
        status: "completed",
        service_order_id: existingOrder.id,
        completed_at: new Date().toISOString(),
      })
      .eq("id", checkout.id);

    return {
      orderId: existingOrder.id,
      orderNumber: existingOrder.order_number,
    };
  }

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
      progress_percent: progressPercentForStatus("paid"),
      amount_cents: checkout.amount_cents,
      currency: checkout.currency,
      stripe_checkout_id: checkout.id,
      metadata: {
        unban: checkout.payload?.unbanDetails ?? null,
        predator: checkout.payload?.predatorDetails ?? null,
      },
      completed_at: null,
      cancelled_at: null,
    })
    .select("id, order_number")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: racedOrder } = await supabase
        .from("service_orders")
        .select("id, order_number")
        .eq("stripe_checkout_id", checkout.id)
        .maybeSingle();

      if (racedOrder) {
        await supabase
          .from("stripe_checkouts")
          .update({
            status: "completed",
            service_order_id: racedOrder.id,
            completed_at: new Date().toISOString(),
          })
          .eq("id", checkout.id);

        return {
          orderId: racedOrder.id,
          orderNumber: racedOrder.order_number,
        };
      }
    }

    throw new Error(error.message ?? "Failed to create order");
  }

  if (!order) {
    throw new Error("Failed to create order");
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

    await sendMarketplaceSoldNotification(checkout.marketplace_listing_id, {
      orderNumber: order.order_number,
      soldVia: "checkout",
    }).catch(() => undefined);
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

  await recordOrderStatusUpdate(order.id, "paid", {
    message: "Payment confirmed — assigning operator",
  });

  if (checkout.customer_email) {
    await sendOrderConfirmationEmail({
      orderNumber: order.order_number,
      orderType: checkout.checkout_kind,
      serviceName: checkout.line_item_name,
      customerEmail: checkout.customer_email,
      customerDiscord: checkout.customer_discord,
      currentRank: checkout.current_rank,
      targetRank: checkout.target_rank,
      serviceDetail: checkout.service_detail,
      amountCents: checkout.amount_cents,
      currency: checkout.currency,
    });
  }

  return { orderId: order.id, orderNumber: order.order_number };
}
