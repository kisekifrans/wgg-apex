import "server-only";

export function getStripeEnv() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return {
    secretKey,
    webhookSecret,
    publishableKey,
    isConfigured: Boolean(secretKey && webhookSecret),
    isCheckoutConfigured: Boolean(secretKey),
  };
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}
