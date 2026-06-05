import "server-only";

import { completePaidCheckout } from "@/lib/checkout/complete-paid-checkout";
import { paypalApi } from "@/lib/paypal/client";
import { getPayPalEnv } from "@/lib/paypal/env";
import {
  handlePayPalCaptureRefunded,
  handlePayPalOrderVoided,
} from "@/lib/paypal/refund-handler";

type PayPalWebhookEvent = {
  id: string;
  event_type: string;
  resource: {
    id?: string;
    custom_id?: string;
    amount?: { value?: string; currency_code?: string };
    supplementary_data?: {
      related_ids?: { order_id?: string };
    };
  };
};

export async function verifyPayPalWebhook(
  headers: Headers,
  body: PayPalWebhookEvent
): Promise<boolean> {
  const { webhookId } = getPayPalEnv();

  if (!webhookId) {
    throw new Error("PAYPAL_WEBHOOK_ID is not configured");
  }

  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");
  const transmissionSig = headers.get("paypal-transmission-sig");

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig
  ) {
    return false;
  }

  const result = await paypalApi<{ verification_status: string }>(
    "/v1/notifications/verify-webhook-signature",
    {
      method: "POST",
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: body,
      }),
    }
  );

  return result.verification_status === "SUCCESS";
}

export async function handlePayPalCaptureCompleted(
  resource: PayPalWebhookEvent["resource"]
): Promise<void> {
  const checkoutId = resource.custom_id;
  if (!checkoutId) {
    throw new Error("Missing custom_id on PayPal capture");
  }

  const paidCents = resource.amount?.value
    ? Math.round(parseFloat(resource.amount.value) * 100)
    : 0;
  const currency = resource.amount?.currency_code ?? "USD";

  await completePaidCheckout(checkoutId, {
    paidCents,
    currency,
    paypalOrderId: resource.supplementary_data?.related_ids?.order_id ?? null,
    paypalCaptureId: resource.id ?? null,
  });
}

export async function handlePayPalWebhookEvent(
  event: PayPalWebhookEvent
): Promise<void> {
  switch (event.event_type) {
    case "PAYMENT.CAPTURE.COMPLETED":
      await handlePayPalCaptureCompleted(event.resource);
      break;
    case "PAYMENT.CAPTURE.REFUNDED":
    case "PAYMENT.CAPTURE.REVERSED":
      await handlePayPalCaptureRefunded(event.resource);
      break;
    case "CHECKOUT.ORDER.VOIDED":
    case "CHECKOUT.ORDER.CANCELLED":
      if (event.resource.id) {
        await handlePayPalOrderVoided(event.resource.id);
      }
      break;
    default:
      break;
  }
}
