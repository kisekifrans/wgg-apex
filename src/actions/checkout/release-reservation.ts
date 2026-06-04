"use server";

import { releaseMarketplaceListingReservation } from "@/lib/checkout/marketplace-reservation";
import { createAdminClient } from "@/lib/supabase/admin";

/** Release marketplace hold when user abandons Stripe checkout. */
export async function releaseCheckoutReservation(
  checkoutId: string
): Promise<void> {
  if (!checkoutId?.trim()) return;

  const supabase = createAdminClient();

  const { data: checkout } = await supabase
    .from("stripe_checkouts")
    .select("marketplace_listing_id, status")
    .eq("id", checkoutId.trim())
    .maybeSingle();

  if (
    checkout?.status === "pending" &&
    checkout.marketplace_listing_id
  ) {
    await releaseMarketplaceListingReservation(checkout.marketplace_listing_id);
  }
}
