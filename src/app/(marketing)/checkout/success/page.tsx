import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { captureAndFulfillPayPalOrder } from "@/actions/checkout/capture-paypal-order";
import { Button } from "@/components/ui/button";
import { getCheckoutByPayPalOrderId } from "@/lib/db/checkout";
import { formatPriceFromCents } from "@/lib/services/format-price";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  let orderNumber: string | null = null;
  let amountCents: number | null = null;
  let pending = false;

  if (token) {
    try {
      if (token) {
        try {
          await captureAndFulfillPayPalOrder(token);
        } catch {
          pending = true;
        }
      }

      const checkout = token
        ? await getCheckoutByPayPalOrderId(token)
        : null;

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

        if (checkout.status === "pending") {
          pending = true;
        }
      }
    } catch {
      pending = true;
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
        <CheckCircle2 className="size-8 text-emerald-400" aria-hidden />
      </div>
      <h1 className="font-heading mt-6 text-3xl font-semibold tracking-tight">
        Payment received
      </h1>
      {pending ? (
        <p className="mt-3 text-muted-foreground">
          We are confirming your payment. Your order will appear in our system
          within a minute.
        </p>
      ) : (
        <p className="mt-3 text-muted-foreground">
          Thank you. A confirmation email is on its way. Our operators will
          reach out on Discord to begin fulfillment.
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
