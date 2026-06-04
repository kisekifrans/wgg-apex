import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CheckoutForm } from "@/components/checkout/checkout-form";
import { Button } from "@/components/ui/button";
import { slugToCheckoutKind } from "@/config/checkout";
import { getServiceBySlug } from "@/lib/db/services-catalog";
import { getStripeEnv } from "@/lib/stripe/env";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug, true).catch(() => null);
  return { title: service ? `Checkout — ${service.name}` : "Checkout" };
}

export default async function ServiceCheckoutPage({ params }: PageProps) {
  const { slug } = await params;

  if (slug === "predator-maintenance") {
    redirect("/services/predator-maintenance");
  }

  if (!slugToCheckoutKind(slug)) {
    notFound();
  }

  let service: Awaited<ReturnType<typeof getServiceBySlug>> = null;
  try {
    service = await getServiceBySlug(slug, true);
  } catch {
    service = null;
  }

  if (!service || service.pricingEngine === "marketplace") {
    notFound();
  }

  const { isCheckoutConfigured } = getStripeEnv();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-6 text-muted-foreground"
        render={<Link href="/" />}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to home
      </Button>

      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          Secure checkout
        </p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight">
          {service.name}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {service.description}
        </p>
      </div>

      {!isCheckoutConfigured ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          Stripe is not configured. Set STRIPE_SECRET_KEY and
          STRIPE_WEBHOOK_SECRET in your environment.
        </div>
      ) : (
        <CheckoutForm
          mode="service"
          service={service}
          serviceSlug={slug}
        />
      )}
    </div>
  );
}
