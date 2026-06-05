import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { captureError } from "@/lib/ops/capture-error";
import { sendOpsAlert } from "@/lib/ops/send-ops-alert";
import {
  claimWebhookEvent,
  completeWebhookEvent,
  failWebhookEvent,
} from "@/lib/checkout/webhook-events";
import { getPayPalEnv } from "@/lib/paypal/env";
import {
  handlePayPalWebhookEvent,
  verifyPayPalWebhook,
} from "@/lib/paypal/webhook";

export const runtime = "nodejs";

const HANDLED_EVENTS = [
  "PAYMENT.CAPTURE.COMPLETED",
  "PAYMENT.CAPTURE.REFUNDED",
  "PAYMENT.CAPTURE.REVERSED",
  "CHECKOUT.ORDER.VOIDED",
  "CHECKOUT.ORDER.CANCELLED",
] as const;

export async function POST(request: Request) {
  const { isWebhookConfigured } = getPayPalEnv();

  if (!isWebhookConfigured) {
    return NextResponse.json(
      { error: "PayPal webhook not configured" },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  let event: {
    id: string;
    event_type: string;
    resource: Record<string, unknown>;
  };

  try {
    event = JSON.parse(rawBody) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const verified = await verifyPayPalWebhook(request.headers, event);
  if (!verified) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (
    !HANDLED_EVENTS.includes(
      event.event_type as (typeof HANDLED_EVENTS)[number]
    )
  ) {
    return NextResponse.json({ received: true });
  }

  const claim = await claimWebhookEvent(event.id, event.event_type);

  if (claim.action === "skip") {
    return NextResponse.json({ received: true, duplicate: true });
  }

  if (claim.action === "duplicate_in_flight") {
    return NextResponse.json(
      { error: "Event already processing" },
      { status: 409 }
    );
  }

  try {
    await handlePayPalWebhookEvent(event);
    await completeWebhookEvent(event.id);

    revalidatePath("/");
    revalidatePath("/admin/orders");
    revalidatePath("/marketplace", "layout");
    revalidatePath("/admin/marketplace");

    return NextResponse.json({ received: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Webhook handler failed";
    console.error("[paypal webhook]", event.event_type, message);
    captureError(err, {
      tags: { area: "paypal-webhook" },
      extra: { eventId: event.id, eventType: event.event_type },
    });
    await sendOpsAlert(
      `PayPal webhook failed: ${event.event_type}`,
      [`Event: ${event.id}`, `Type: ${event.event_type}`, `Error: ${message}`].join(
        "\n"
      )
    );
    await failWebhookEvent(event.id, message);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
