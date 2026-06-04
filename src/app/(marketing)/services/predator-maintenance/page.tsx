import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PredatorIntakeForm } from "@/components/predator/predator-intake-form";
import { PredatorNoticeCards } from "@/components/predator/predator-notice-cards";
import { Button } from "@/components/ui/button";
import { getServiceBySlug } from "@/lib/db/services-catalog";
import { getStripeEnv } from "@/lib/stripe/env";

export const metadata = {
  title: "Predator Maintenance",
  description:
    "Nintendo (Switch) Predator RP maintenance with operator access. Review requirements, backup codes, and secure checkout.",
};

export default async function PredatorMaintenanceServicePage() {
  let service: Awaited<ReturnType<typeof getServiceBySlug>> = null;

  try {
    service = await getServiceBySlug("predator-maintenance", true);
  } catch {
    service = null;
  }

  if (!service || service.pricingItems.length === 0) {
    notFound();
  }

  const { isCheckoutConfigured } = getStripeEnv();

  return (
    <div className="relative overflow-hidden pb-24 pt-28">
      <div
        className="pointer-events-none absolute inset-0 bg-brand-glow opacity-30"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-8 text-muted-foreground"
          render={<Link href="/#predator-plans" />}
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back to plans
        </Button>

        <header className="max-w-3xl">
          <p className="text-sm font-medium tracking-wide text-[var(--brand-gold)]">
            Predator maintenance
          </p>
          <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {service.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {service.description}
          </p>
        </header>

        <div className="mt-12">
          <PredatorNoticeCards />
        </div>

        <div className="mt-16">
          {!isCheckoutConfigured ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
              Payments are not configured. Contact{" "}
              <a
                href="mailto:support@wggapex.com"
                className="font-medium text-primary hover:underline"
              >
                support
              </a>{" "}
              to place an order.
            </div>
          ) : (
            <PredatorIntakeForm
              service={service}
              stripeEnabled={isCheckoutConfigured}
            />
          )}
        </div>
      </div>
    </div>
  );
}
