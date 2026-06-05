import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { TrackOrderForm } from "@/components/orders/track-order-form";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Track Order",
  description:
    "Look up your WGG Apex order status with your order number and checkout email.",
};

type PageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function TrackOrderPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialOrderNumber = params.order?.trim() ?? "";

  return (
    <div className="mx-auto max-w-xl px-4 py-12 pb-24 pt-28 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-8 text-muted-foreground"
        render={<Link href="/" />}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to home
      </Button>

      <header className="mb-10">
        <p className="text-sm font-medium tracking-wide text-[var(--brand-gold)]">
          Order tracking
        </p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Track Your Order
        </h1>
        <p className="mt-3 text-muted-foreground">
          Enter your order number and the email you used at checkout. We never
          show orders without both.
        </p>
      </header>

      <TrackOrderForm initialOrderNumber={initialOrderNumber} />
    </div>
  );
}
