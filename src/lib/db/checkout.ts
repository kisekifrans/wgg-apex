import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getCheckoutByStripeSessionId(sessionId: string) {
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
      service_orders (
        order_number,
        status,
        payment_status
      )
    `
    )
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data;
}

export type PendingStripeCheckout = {
  id: string;
  status: string;
  amountCents: number;
  currency: string;
  customerDiscord: string;
  customerEmail: string | null;
  lineItemName: string;
  stripeSessionId: string | null;
  createdAt: string;
};

export async function getPendingStripeCheckouts(
  limit = 10
): Promise<PendingStripeCheckout[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("stripe_checkouts")
    .select(
      "id, status, amount_cents, currency, customer_discord, customer_email, line_item_name, stripe_session_id, created_at"
    )
    .eq("status", "pending")
    .not("stripe_session_id", "is", null)
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
    stripeSessionId: row.stripe_session_id,
    createdAt: row.created_at,
  }));
}
