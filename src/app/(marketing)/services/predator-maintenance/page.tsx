import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PaymentPreviewNotice } from "@/components/checkout/payment-preview-notice";
import { PredatorIntakeForm } from "@/components/predator/predator-intake-form";
import { PredatorNoticeCards } from "@/components/predator/predator-notice-cards";
import { Button } from "@/components/ui/button";
import { getServiceBySlug } from "@/lib/db/services-catalog";
import { getPayPalEnv } from "@/lib/paypal/env";

export const metadata = {
  title: "Predator Maintenance",
  description:
    "Nintendo (Switch) Predator RP maintenance with operator access. Review requirements, backup codes, and secure checkout.",
};

type PageProps = {
  searchParams: Promise<{ promo?: string }>;
};

export default async function PredatorMaintenanceServicePage({
  searchParams,
}: PageProps) {
  const { promo } = await searchParams;
  let service: Awaited<ReturnType<typeof getServiceBySlug>> = null;

  try {
    service = await getServiceBySlug("predator-maintenance", true);
  } catch {
    service = null;
  }

  if (!service || service.pricingItems.length === 0) {
    notFound();
  }

  const { isConfigured: isCheckoutConfigured } = getPayPalEnv();

  return (
    <div className="relative overflow-hidden pb-24 pt-28">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-8 text-muted-foreground"
          render={<Link href="/#predator-plans" />}
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back to Plans
        </Button>

        <header className="max-w-3xl">
          <p className="text-sm font-medium tracking-wide text-[var(--brand-gold)]">
            Predator Maintenance
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

        <div className="mt-16 space-y-6">
          {!isCheckoutConfigured && <PaymentPreviewNotice />}
          <PredatorIntakeForm
            service={service}
            paymentsEnabled={isCheckoutConfigured}
            initialPromoCode={promo ?? ""}
          />
        </div>
      </div>
    </div>
  );
}
