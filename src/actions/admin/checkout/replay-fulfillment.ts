"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { handleCheckoutSessionCompleted } from "@/lib/stripe/webhook";
import { getStripe } from "@/lib/stripe/client";
import { getStripeEnv } from "@/lib/stripe/env";
import { createAdminClient } from "@/lib/supabase/admin";

export type ReplayFulfillmentResult =
  | { success: true; orderNumber?: string }
  | { success: false; error: string };

export async function replayCheckoutFulfillment(
  checkoutId: string
): Promise<ReplayFulfillmentResult> {
  await requireAdmin();

  const { isCheckoutConfigured } = getStripeEnv();
  if (!isCheckoutConfigured) {
    return { success: false, error: "Stripe is not configured" };
  }

  const supabase = createAdminClient();

  const { data: checkout, error } = await supabase
    .from("stripe_checkouts")
    .select(
      "id, status, stripe_session_id, service_order_id, customer_discord, line_item_name"
    )
    .eq("id", checkoutId)
    .maybeSingle();

  if (error || !checkout) {
    return { success: false, error: "Checkout not found" };
  }

  if (checkout.status === "completed" && checkout.service_order_id) {
    return { success: false, error: "Checkout already fulfilled" };
  }

  if (!checkout.stripe_session_id) {
    return {
      success: false,
      error: "No Stripe session on this checkout — customer may not have paid",
    };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(
      checkout.stripe_session_id
    );

    if (session.payment_status !== "paid") {
      return {
        success: false,
        error: `Stripe session is not paid (status: ${session.payment_status})`,
      };
    }

    await handleCheckoutSessionCompleted(session);

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
