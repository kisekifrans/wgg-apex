"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { releaseMarketplaceListingReservation } from "@/lib/checkout/marketplace-reservation";
import { createAdminClient } from "@/lib/supabase/admin";

export type DismissPendingCheckoutResult =
  | { success: true }
  | { success: false; error: string };

/** Marks a stuck pending PayPal checkout as expired so it leaves the admin queue. */
export async function dismissPendingCheckout(
  checkoutId: string
): Promise<DismissPendingCheckoutResult> {
  await requireAdmin();

  const supabase = createAdminClient();

  const { data: checkout, error } = await supabase
    .from("stripe_checkouts")
    .select("id, status, marketplace_listing_id, service_order_id")
    .eq("id", checkoutId)
    .maybeSingle();

  if (error || !checkout) {
    return { success: false, error: "Checkout not found" };
  }

  if (checkout.service_order_id) {
    return {
      success: false,
      error: "This checkout already has an order — use Orders instead",
    };
  }

  if (checkout.status !== "pending") {
    return {
      success: false,
      error: `Only pending checkouts can be dismissed (status: ${checkout.status})`,
    };
  }

  const { error: updateError } = await supabase
    .from("stripe_checkouts")
    .update({ status: "expired" })
    .eq("id", checkoutId)
    .eq("status", "pending");

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  if (checkout.marketplace_listing_id) {
    await releaseMarketplaceListingReservation(
      checkout.marketplace_listing_id
    ).catch(() => undefined);
  }

  revalidatePath("/admin/orders");

  return { success: true };
}
