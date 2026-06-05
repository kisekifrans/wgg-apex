import Link from "next/link";
import { XCircle } from "lucide-react";

import { releaseCheckoutReservation } from "@/actions/checkout/release-reservation";
import { Button } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<{ checkout_id?: string }>;
};

export default async function CheckoutCancelPage({ searchParams }: PageProps) {
  const { checkout_id: checkoutId } = await searchParams;

  if (checkoutId) {
    try {
      await releaseCheckoutReservation(checkoutId);
    } catch {
      // PayPal void webhook will release if this fails
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/5">
        <XCircle className="size-8 text-muted-foreground" aria-hidden />
      </div>
      <h1 className="font-heading mt-6 text-3xl font-semibold tracking-tight">
        Checkout cancelled
      </h1>
      <p className="mt-3 text-muted-foreground">
        No payment was taken. You can return and try again when ready.
      </p>
      <Button
        className="mt-8 bg-primary text-primary-foreground"
        render={<Link href="/" />}
      >
        Back to home
      </Button>
    </div>
  );
}
