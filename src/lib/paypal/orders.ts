import "server-only";

import { paypalApi } from "@/lib/paypal/client";

type PayPalLink = {
  href: string;
  rel: string;
  method?: string;
};

type PayPalAmount = {
  currency_code: string;
  value: string;
};

type PayPalCapture = {
  id: string;
  status: string;
  amount: PayPalAmount;
};

type PayPalPurchaseUnit = {
  reference_id?: string;
  custom_id?: string;
  amount?: PayPalAmount;
  payments?: {
    captures?: PayPalCapture[];
  };
};

export type PayPalOrder = {
  id: string;
  status: string;
  purchase_units: PayPalPurchaseUnit[];
};

function formatPayPalAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

export async function createPayPalOrder(params: {
  checkoutId: string;
  amountCents: number;
  currency: string;
  lineItemName: string;
  lineItemDescription: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ orderId: string; approvalUrl: string }> {
  const order = await paypalApi<PayPalOrder & { links: PayPalLink[] }>(
    "/v2/checkout/orders",
    {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: params.checkoutId,
            custom_id: params.checkoutId,
            description: params.lineItemDescription.slice(0, 127),
            amount: {
              currency_code: params.currency.toUpperCase(),
              value: formatPayPalAmount(params.amountCents),
            },
          },
        ],
        application_context: {
          brand_name: "WGG Apex",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: params.returnUrl,
          cancel_url: params.cancelUrl,
        },
      }),
    }
  );

  const approvalUrl = order.links.find((link) => link.rel === "approve")?.href;

  if (!approvalUrl) {
    throw new Error("PayPal did not return an approval URL");
  }

  return { orderId: order.id, approvalUrl };
}

export async function getPayPalOrder(orderId: string): Promise<PayPalOrder> {
  return paypalApi<PayPalOrder>(`/v2/checkout/orders/${orderId}`);
}

export function extractCaptureFromOrder(order: PayPalOrder): {
  checkoutId: string | null;
  captureId: string | null;
  paidCents: number | null;
  currency: string | null;
} {
  const unit = order.purchase_units[0];
  const capture = unit?.payments?.captures?.[0];

  if (!capture || capture.status !== "COMPLETED") {
    return {
      checkoutId: unit?.custom_id ?? unit?.reference_id ?? null,
      captureId: null,
      paidCents: null,
      currency: null,
    };
  }

  const paidCents = Math.round(parseFloat(capture.amount.value) * 100);

  return {
    checkoutId: unit.custom_id ?? unit.reference_id ?? null,
    captureId: capture.id,
    paidCents,
    currency: capture.amount.currency_code,
  };
}

export async function capturePayPalOrder(
  orderId: string
): Promise<PayPalOrder> {
  const existing = await getPayPalOrder(orderId);
  const { captureId } = extractCaptureFromOrder(existing);

  if (captureId) {
    return existing;
  }

  if (existing.status !== "APPROVED") {
    throw new Error(`PayPal order is not ready to capture (status: ${existing.status})`);
  }

  return paypalApi<PayPalOrder>(`/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
  });
}
