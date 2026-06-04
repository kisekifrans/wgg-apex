import "server-only";

import Stripe from "stripe";

import { getStripeEnv } from "@/lib/stripe/env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  const { secretKey } = getStripeEnv();

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      typescript: true,
    });
  }

  return stripeClient;
}
