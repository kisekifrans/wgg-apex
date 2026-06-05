"use server";

import { completePaidCheckout } from "@/lib/checkout/complete-paid-checkout";
import {
  capturePayPalOrder,
  extractCaptureFromOrder,
} from "@/lib/paypal/orders";

export async function captureAndFulfillPayPalOrder(
  paypalOrderId: string
): Promise<void> {
  const order = await capturePayPalOrder(paypalOrderId);
  const { checkoutId, captureId, paidCents, currency } =
    extractCaptureFromOrder(order);

  if (!checkoutId || paidCents == null || !currency) {
    throw new Error("PayPal order is not fully captured yet");
  }

  await completePaidCheckout(checkoutId, {
    paidCents,
    currency,
    paypalOrderId: order.id,
    paypalCaptureId: captureId,
  });
}
