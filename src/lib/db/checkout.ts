import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getCheckoutByPayPalOrderId(paypalOrderId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stripe_checkouts")
    .select(
      `
      id,
      status,
      amount_cents,
      currency,
      checkout_kind,
      customer_discord,
      customer_email,
      line_item_name,
      service_order_id,
      paypal_order_id,
      service_orders (
        order_number,
        status,
        payment_status
      )
    `
    )
    .eq("paypal_order_id", paypalOrderId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}

export async function getServiceOrderNumberById(
  orderId: string
): Promise<string | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("service_orders")
    .select("order_number")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data?.order_number ?? null;
}

export async function getCheckoutById(checkoutId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stripe_checkouts")
    .select(
      `
      id,
      status,
      amount_cents,
      currency,
      checkout_kind,
      customer_discord,
      customer_email,
      line_item_name,
      service_order_id,
      paypal_order_id,
      service_orders (
        order_number,
        status,
        payment_status
      )
    `
    )
    .eq("id", checkoutId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}

export type PendingPayPalCheckout = {
  id: string;
  status: string;
  amountCents: number;
  currency: string;
  customerDiscord: string;
  customerEmail: string | null;
  lineItemName: string;
  paypalOrderId: string | null;
  createdAt: string;
};

export async function getPendingPayPalCheckouts(
  limit = 10
): Promise<PendingPayPalCheckout[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stripe_checkouts")
    .select(
      "id, status, amount_cents, currency, customer_discord, customer_email, line_item_name, paypal_order_id, created_at"
    )
    .eq("status", "pending")
    .not("paypal_order_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    status: row.status,
    amountCents: row.amount_cents,
    currency: row.currency,
    customerDiscord: row.customer_discord,
    customerEmail: row.customer_email,
    lineItemName: row.line_item_name,
    paypalOrderId: row.paypal_order_id,
    createdAt: row.created_at,
  }));
}
