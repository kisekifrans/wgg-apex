import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  handleChargeRefunded,
  handlePaymentIntentFailed,
} from "@/lib/stripe/refund-handler";
import { captureError } from "@/lib/ops/capture-error";
import { sendOpsAlert } from "@/lib/ops/send-ops-alert";
import {
  claimWebhookEvent,
  completeWebhookEvent,
  failWebhookEvent,
  handleCheckoutSessionCompleted,
  handleCheckoutSessionExpired,
} from "@/lib/stripe/webhook";
import { getStripe } from "@/lib/stripe/client";
import { getStripeEnv } from "@/lib/stripe/env";

export const runtime = "nodejs";

const HANDLED_EVENTS = [
  "checkout.session.completed",
  "checkout.session.expired",
  "charge.refunded",
  "payment_intent.payment_failed",
] as const;

export async function POST(request: Request) {
  const { webhookSecret } = getStripeEnv();

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const rawBody = await request.text();

  let event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!HANDLED_EVENTS.includes(event.type as (typeof HANDLED_EVENTS)[number])) {
    return NextResponse.json({ received: true });
  }

  const claim = await claimWebhookEvent(event.id, event.type);

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
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case "checkout.session.expired":
        await handleCheckoutSessionExpired(event.data.object);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;
    }

    await completeWebhookEvent(event.id);

    revalidatePath("/");
    revalidatePath("/admin/orders");
    revalidatePath("/marketplace", "layout");
    revalidatePath("/admin/marketplace");

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler failed";
    console.error("[stripe webhook]", event.type, message);
    captureError(err, {
      tags: { area: "stripe-webhook" },
      extra: { eventId: event.id, eventType: event.type },
    });
    await sendOpsAlert(
      `Stripe webhook failed: ${event.type}`,
      [`Event: ${event.id}`, `Type: ${event.type}`, `Error: ${message}`].join(
        "\n"
      )
    );
    await failWebhookEvent(event.id, message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
