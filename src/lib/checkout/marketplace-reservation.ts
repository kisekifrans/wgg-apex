import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/** Atomically reserve a listing for checkout (prevents double-sale). */
export async function reserveMarketplaceListing(
  listingId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("marketplace_listings")
    .update({ status: "reserved" })
    .eq("id", listingId)
    .eq("status", "available")
    .select("id")
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  if (!data) {
    return {
      success: false,
      error: "This listing is no longer available for purchase",
    };
  }

  return { success: true };
}

/** Release reservation when checkout expires or fails (not after sold). */
export async function releaseMarketplaceListingReservation(
  listingId: string
): Promise<void> {
  const supabase = createAdminClient();

  await supabase
    .from("marketplace_listings")
    .update({ status: "available" })
    .eq("id", listingId)
    .eq("status", "reserved");
}
