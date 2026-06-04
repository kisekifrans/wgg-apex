"use server";

import { headers } from "next/headers";

import { reserveMarketplaceListing, releaseMarketplaceListingReservation } from "@/lib/checkout/marketplace-reservation";
import { buildCheckoutQuote } from "@/lib/checkout/quote";
import { getServiceBySlug } from "@/lib/db/services-catalog";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getStripe } from "@/lib/stripe/client";
import { getSiteUrl, getStripeEnv } from "@/lib/stripe/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { predatorIntakeSchema } from "@/lib/validations/predator-intake";
import { unbanIntakeSchema } from "@/lib/validations/unban-intake";
import { formatPredatorNotes } from "@/types/predator";
import { formatUnbanNotes } from "@/types/unban";
import type { CheckoutFormInput } from "@/types/checkout";

export type CheckoutActionResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function createCheckoutSession(
  serviceSlug: string | null,
  input: CheckoutFormInput
): Promise<CheckoutActionResult> {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const rateLimit = checkRateLimit(`checkout:${ip}`, {
    limit: 20,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Too many checkout attempts. Try again in ${rateLimit.retryAfterSec} seconds.`,
    };
  }

  const { isCheckoutConfigured } = getStripeEnv();

  if (!isCheckoutConfigured) {
    return {
      success: false,
      error: "Payments are not configured. Contact support.",
    };
  }

  const discord = input.customerDiscord?.trim();
  if (!discord || discord.length < 2) {
    return { success: false, error: "Discord handle is required" };
  }

  let unbanDetails = input.unbanDetails;
  let predatorDetails = input.predatorDetails;
  let customerEmail = input.customerEmail?.trim() || null;
  let notes = input.notes?.trim() || null;

  if (serviceSlug === "predator-maintenance") {
    const parsed = predatorIntakeSchema.safeParse({
      customerDiscord: discord,
      currentRank: input.currentRank,
      nintendoBackupCode: input.predatorDetails?.nintendoBackupCode,
      eaEmail: input.predatorDetails?.eaEmail,
      eaPassword: input.predatorDetails?.eaPassword,
      eaBackupCode: input.predatorDetails?.eaBackupCode,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid account details",
      };
    }

    if (!input.pricingItemId) {
      return { success: false, error: "Please select a maintenance plan" };
    }

    const service = await getServiceBySlug("predator-maintenance", true);
    const plan = service?.pricingItems.find((i) => i.id === input.pricingItemId);
    if (!plan) {
      return { success: false, error: "Invalid maintenance plan" };
    }

    predatorDetails = {
      nintendoBackupCode: parsed.data.nintendoBackupCode,
      eaEmail: parsed.data.eaEmail,
      eaPassword: parsed.data.eaPassword,
      eaBackupCode: parsed.data.eaBackupCode,
    };
    customerEmail = parsed.data.eaEmail;
    notes = formatPredatorNotes(
      predatorDetails,
      discord,
      parsed.data.currentRank,
      plan.name
    );
  }

  if (serviceSlug === "apex-unban") {
    const parsed = unbanIntakeSchema.safeParse({
      customerDiscord: discord,
      eaLoginId: input.unbanDetails?.eaLoginId,
      eaEmail: input.unbanDetails?.eaEmail,
      banDate: input.unbanDetails?.banDate,
      previousAppeals: input.unbanDetails?.previousAppeals,
      additionalNotes: input.unbanDetails?.additionalNotes,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid case details",
      };
    }

    unbanDetails = {
      eaLoginId: parsed.data.eaLoginId.trim(),
      eaEmail: parsed.data.eaEmail.trim(),
      banDate: parsed.data.banDate,
      previousAppeals: parsed.data.previousAppeals.trim(),
      additionalNotes: parsed.data.additionalNotes?.trim() || null,
    };
    customerEmail = unbanDetails.eaEmail;
    notes = formatUnbanNotes(unbanDetails, discord);
  }

  const quoteResult = await buildCheckoutQuote(serviceSlug, {
    ...input,
    customerDiscord: discord,
  });

  if (!quoteResult.success) {
    return { success: false, error: quoteResult.error };
  }

  const { quote } = quoteResult;
  const supabase = createAdminClient();
  const siteUrl = getSiteUrl();

  if (quote.marketplaceListingId) {
    const reserve = await reserveMarketplaceListing(quote.marketplaceListingId);
    if (!reserve.success) {
      return { success: false, error: reserve.error };
    }
  }

  const { data: checkoutRow, error: insertError } = await supabase
    .from("stripe_checkouts")
    .insert({
      status: "pending",
      amount_cents: quote.amountCents,
      currency: quote.currency,
      checkout_kind: quote.checkoutKind,
      service_slug: quote.serviceSlug,
      pricing_item_id: quote.pricingItemId,
      marketplace_listing_id: quote.marketplaceListingId,
      customer_discord: discord,
      customer_email: customerEmail,
      current_rank: input.currentRank?.trim() || null,
      target_rank: input.targetRank?.trim() || null,
      notes,
      service_detail: quote.serviceDetail,
      line_item_name: quote.lineItemName,
      payload: {
        lineItemDescription: quote.lineItemDescription,
        pricingItemId: quote.pricingItemId,
        listingId: quote.marketplaceListingId,
        unbanDetails: unbanDetails ?? null,
        predatorDetails: predatorDetails ?? null,
      },
    })
    .select("id")
    .single();

  if (insertError || !checkoutRow) {
    if (quote.marketplaceListingId) {
      await releaseMarketplaceListingReservation(quote.marketplaceListingId);
    }
    return {
      success: false,
      error: insertError?.message ?? "Failed to initialize checkout",
    };
  }

  const checkoutId = checkoutRow.id;

  try {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: input.customerEmail?.trim() || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: quote.currency.toLowerCase(),
            unit_amount: quote.amountCents,
            product_data: {
              name: quote.lineItemName,
              description: quote.lineItemDescription,
            },
          },
        },
      ],
      metadata: {
        checkout_id: checkoutId,
        checkout_kind: quote.checkoutKind,
        service_slug: quote.serviceSlug,
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel?checkout_id=${checkoutId}`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });

    if (!session.url) {
      return { success: false, error: "Stripe did not return a checkout URL" };
    }

    const { error: updateError } = await supabase
      .from("stripe_checkouts")
      .update({ stripe_session_id: session.id })
      .eq("id", checkoutId);

    if (updateError) {
      if (quote.marketplaceListingId) {
        await releaseMarketplaceListingReservation(quote.marketplaceListingId);
      }
      return { success: false, error: updateError.message };
    }

    return { success: true, url: session.url };
  } catch (e) {
    await supabase
      .from("stripe_checkouts")
      .update({ status: "failed" })
      .eq("id", checkoutId);

    if (quote.marketplaceListingId) {
      await releaseMarketplaceListingReservation(quote.marketplaceListingId);
    }

    const message =
      e instanceof Error ? e.message : "Failed to create checkout session";
    return { success: false, error: message };
  }
}
