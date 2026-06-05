import "server-only";

export function getPayPalEnv() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim() ?? "";
  const webhookId = process.env.PAYPAL_WEBHOOK_ID?.trim() ?? "";
  const mode = (process.env.PAYPAL_MODE?.trim() ?? "sandbox").toLowerCase();

  const apiBase =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  return {
    clientId,
    clientSecret,
    webhookId,
    mode: mode === "live" ? ("live" as const) : ("sandbox" as const),
    apiBase,
    isConfigured: Boolean(clientId && clientSecret),
    isWebhookConfigured: Boolean(clientId && clientSecret && webhookId),
  };
}
