import Link from "next/link";
import { CheckCircle2, Clock3 } from "lucide-react";

import { captureAndFulfillPayPalOrder } from "@/actions/checkout/capture-paypal-order";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import {
  getCheckoutByPayPalOrderId,
  getServiceOrderNumberById,
} from "@/lib/db/checkout";
import { formatPriceFromCents } from "@/lib/services/format-price";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

type SuccessState = "completed" | "pending" | "missing_token";

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  let orderNumber: string | null = null;
  let amountCents: number | null = null;
  let state: SuccessState = "missing_token";

  if (token?.trim()) {
    state = "pending";

    try {
      try {
        await captureAndFulfillPayPalOrder(token);
      } catch (err) {
        console.error("[checkout/success] PayPal capture failed:", err);
      }

      const checkout = await getCheckoutByPayPalOrderId(token);

      if (checkout) {
        amountCents = checkout.amount_cents;
        const orders = checkout.service_orders as
          | { order_number: string }
          | { order_number: string }[]
          | null;

        if (orders) {
          const order = Array.isArray(orders) ? orders[0] : orders;
          orderNumber = order?.order_number ?? null;
        }

        if (!orderNumber && checkout.service_order_id) {
          orderNumber = await getServiceOrderNumberById(
            checkout.service_order_id
          );
        }

        if (checkout.status === "completed" || orderNumber) {
          state = "completed";
        }
      }
    } catch (err) {
      console.error("[checkout/success] Fulfillment lookup failed:", err);
      state = "pending";
    }
  }

  const isCompleted = state === "completed";
  const isPending = state === "pending";

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div
        className={`mx-auto flex size-16 items-center justify-center rounded-full ${
          isCompleted
            ? "bg-emerald-500/10"
            : isPending
              ? "bg-amber-500/10"
              : "bg-white/5"
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 className="size-8 text-emerald-400" aria-hidden />
        ) : (
          <Clock3
            className={`size-8 ${isPending ? "text-amber-400" : "text-muted-foreground"}`}
            aria-hidden
          />
        )}
      </div>

      <h1 className="font-heading mt-6 text-3xl font-semibold tracking-tight">
        {isCompleted
          ? "Payment received"
          : isPending
            ? "Confirming your payment"
            : "Checkout incomplete"}
      </h1>

      {isCompleted ? (
        <p className="mt-3 text-muted-foreground">
          Thank you. A confirmation email is on its way. Our operators will
          reach out on Discord to begin fulfillment.
        </p>
      ) : isPending ? (
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            PayPal may have already charged you — that is normal. We are still
            finishing the order on our side. If you already got a confirmation
            email, your payment went through; refresh this page or use Track
            Order.
          </p>
          <p>
            If nothing changes after a minute, contact{" "}
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="font-medium text-primary hover:underline"
            >
              {siteConfig.supportEmail}
            </a>{" "}
            with your Discord username and checkout time.
          </p>
        </div>
      ) : (
        <p className="mt-3 text-muted-foreground">
          We could not find a PayPal payment reference. Return to checkout and
          try again, or contact{" "}
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="font-medium text-primary hover:underline"
          >
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      )}

      {orderNumber && (
        <p className="mt-4 font-mono text-sm text-primary">{orderNumber}</p>
      )}
      {amountCents != null && (
        <p className="mt-2 font-mono text-lg font-semibold tabular-nums">
          {formatPriceFromCents(amountCents)}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        {orderNumber ? (
          <Button
            className="bg-primary text-primary-foreground"
            render={
              <Link
                href={`/track-order?order=${encodeURIComponent(orderNumber)}`}
              />
            }
          >
            Track Order
          </Button>
        ) : (
          <Button
            className="bg-primary text-primary-foreground"
            render={<Link href="/track-order" />}
          >
            Track Order
          </Button>
        )}
        <Button
          variant="outline"
          className="border-white/10"
          render={<Link href="/" />}
        >
          Back to home
        </Button>
      </div>
    </div>
  );
}
