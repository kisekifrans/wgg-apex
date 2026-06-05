"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { completePaidCheckout } from "@/lib/checkout/complete-paid-checkout";
import { getPayPalEnv } from "@/lib/paypal/env";
import {
  capturePayPalOrder,
  extractCaptureFromOrder,
} from "@/lib/paypal/orders";
import { createAdminClient } from "@/lib/supabase/admin";

export type ReplayFulfillmentResult =
  | { success: true; orderNumber?: string }
  | { success: false; error: string };

export async function replayCheckoutFulfillment(
  checkoutId: string
): Promise<ReplayFulfillmentResult> {
  await requireAdmin();

  const { isConfigured } = getPayPalEnv();
  if (!isConfigured) {
    return { success: false, error: "PayPal is not configured" };
  }

  const supabase = createAdminClient();

  const { data: checkout, error } = await supabase
    .from("stripe_checkouts")
    .select(
      "id, status, paypal_order_id, service_order_id, customer_discord, line_item_name, amount_cents, currency"
    )
    .eq("id", checkoutId)
    .maybeSingle();

  if (error || !checkout) {
    return { success: false, error: "Checkout not found" };
  }

  if (checkout.status === "completed" && checkout.service_order_id) {
    return { success: false, error: "Checkout already fulfilled" };
  }

  if (!checkout.paypal_order_id) {
    return {
      success: false,
      error: "No PayPal order on this checkout — customer may not have paid",
    };
  }

  try {
    const order = await capturePayPalOrder(checkout.paypal_order_id);
    const { captureId, paidCents, currency } = extractCaptureFromOrder(order);

    if (!captureId || paidCents == null || !currency) {
      return {
        success: false,
        error: `PayPal capture did not complete (status: ${order.status}). If this checkout is old, the customer may need to pay again.`,
      };
    }

    await completePaidCheckout(checkoutId, {
      paidCents,
      currency,
      paypalOrderId: order.id,
      paypalCaptureId: captureId,
    });

    const { data: refreshed } = await supabase
      .from("stripe_checkouts")
      .select("service_order_id, service_orders(order_number)")
      .eq("id", checkoutId)
      .maybeSingle();

    const orders = refreshed?.service_orders as
      | { order_number: string }
      | { order_number: string }[]
      | null;
    const orderNumber = orders
      ? Array.isArray(orders)
        ? orders[0]?.order_number
        : orders.order_number
      : undefined;

    revalidatePath("/admin/orders");
    revalidatePath("/");

    return { success: true, orderNumber };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Fulfillment failed";
    return { success: false, error: message };
  }
}
