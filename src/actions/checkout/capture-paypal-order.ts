"use server";

import { headers } from "next/headers";

import { completePaidCheckout } from "@/lib/checkout/complete-paid-checkout";
import { getCheckoutByPayPalOrderId } from "@/lib/db/checkout";
import {
  capturePayPalOrder,
  extractCaptureFromOrder,
} from "@/lib/paypal/orders";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function captureAndFulfillPayPalOrder(
  paypalOrderId: string
): Promise<void> {
  const trimmed = paypalOrderId?.trim();
  if (!trimmed) {
    throw new Error("Missing PayPal order ID");
  }

  const headersList = await headers();
  const ip = getClientIp(headersList);
  const rateLimit = checkRateLimit(`capture:${ip}`, {
    limit: 30,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    throw new Error("Too many capture attempts. Try again shortly.");
  }

  const checkout = await getCheckoutByPayPalOrderId(trimmed);
  if (!checkout) {
    throw new Error("Checkout session not found for this payment");
  }

  if (checkout.status === "completed") {
    return;
  }

  if (checkout.paypal_order_id && checkout.paypal_order_id !== trimmed) {
    throw new Error("PayPal order does not match checkout session");
  }

  const order = await capturePayPalOrder(trimmed);
  const { checkoutId, captureId, paidCents, currency } =
    extractCaptureFromOrder(order);

  if (!checkoutId || paidCents == null || !currency) {
    throw new Error("PayPal order is not fully captured yet");
  }

  if (checkout.id !== checkoutId) {
    throw new Error("PayPal order does not match checkout session");
  }

  await completePaidCheckout(checkoutId, {
    paidCents,
    currency,
    paypalOrderId: order.id,
    paypalCaptureId: captureId,
  });
}
