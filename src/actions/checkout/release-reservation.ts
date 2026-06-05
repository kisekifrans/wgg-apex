"use server";

import { headers } from "next/headers";

import { releaseMarketplaceListingReservation } from "@/lib/checkout/marketplace-reservation";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { timingSafeEqual } from "crypto";

function tokensMatch(expected: string, provided: string): boolean {
  if (expected.length !== provided.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
}

/** Release marketplace hold when user abandons PayPal checkout. */
export async function releaseCheckoutReservation(
  checkoutId: string,
  fulfillmentToken: string
): Promise<void> {
  const id = checkoutId?.trim();
  const token = fulfillmentToken?.trim();

  if (!id || !token) {
    return;
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);
  const rateLimit = checkRateLimit(`release:${ip}`, {
    limit: 40,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return;
  }

  const supabase = createAdminClient();

  const { data: checkout } = await supabase
    .from("stripe_checkouts")
    .select("marketplace_listing_id, status, fulfillment_token")
    .eq("id", id)
    .maybeSingle();

  if (!checkout?.fulfillment_token) {
    return;
  }

  if (!tokensMatch(checkout.fulfillment_token, token)) {
    return;
  }

  if (checkout.status === "pending" && checkout.marketplace_listing_id) {
    await releaseMarketplaceListingReservation(checkout.marketplace_listing_id);
  }
}
