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
