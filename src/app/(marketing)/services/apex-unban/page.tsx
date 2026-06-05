import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileSearch,
  Scale,
  Shield,
} from "lucide-react";

import { PaymentPreviewNotice } from "@/components/checkout/payment-preview-notice";
import { UnbanIntakeForm } from "@/components/unban/unban-intake-form";
import { UnbanNoticeCards } from "@/components/unban/unban-notice-cards";
import { Button } from "@/components/ui/button";
import { unbanProcessSteps } from "@/config/unban-service";
import { getServiceBySlug } from "@/lib/db/services-catalog";
import { getPayPalEnv } from "@/lib/paypal/env";
import { formatPriceFromCents } from "@/lib/services/format-price";

export const metadata = {
  title: "Apex Unban Service",
  description:
    "Structured EA account recovery support with eligibility screening, documented timelines, and secure PayPal checkout.",
};

export default async function ApexUnbanServicePage() {
  let service: Awaited<ReturnType<typeof getServiceBySlug>> = null;

  try {
    service = await getServiceBySlug("apex-unban", true);
  } catch {
    service = null;
  }

  if (!service) {
    notFound();
  }

  const pricingItem = service.pricingItems[0];
  if (!pricingItem) {
    notFound();
  }

  const { isConfigured: isCheckoutConfigured } = getPayPalEnv();
  const features = service.displayConfig?.features ?? [];

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-8 text-muted-foreground"
          render={<Link href="/" />}
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back to home
        </Button>

        <header className="max-w-3xl">
          <p className="text-sm font-medium tracking-wide text-[var(--brand-gold)]">
            Account recovery
          </p>
          <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {service.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {service.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono font-semibold text-primary">
              From {formatPriceFromCents(pricingItem.priceCents)}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Shield className="size-4 text-primary" aria-hidden />
              Operator-screened cases only
            </span>
          </div>
        </header>

        <div className="mt-12">
          <UnbanNoticeCards />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <h2 className="font-heading text-xl font-semibold">How it works</h2>
            <ol className="mt-6 space-y-6">
              {unbanProcessSteps.map((step) => (
                <li key={step.step} className="flex gap-4">
                  <span className="font-mono text-sm font-semibold text-primary">
                    {step.step}
                  </span>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {features.length > 0 && (
              <ul className="mt-10 space-y-3 border-t border-white/5 pt-8">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10 grid gap-3">
              <WorkflowPill
                icon={FileSearch}
                title="Eligibility Screen"
                text="Context reviewed before substantive work"
              />
              <WorkflowPill
                icon={Scale}
                title="Case Documentation"
                text="Timeline logged with operator notes"
              />
              <WorkflowPill
                icon={Shield}
                title="Next Steps"
                text="Clear guidance—no false guarantees"
              />
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {!isCheckoutConfigured && <PaymentPreviewNotice />}
            <UnbanIntakeForm
              service={service}
              pricingItem={pricingItem}
              paymentsEnabled={isCheckoutConfigured}
            />
          </div>
        </div>

        <p className="mt-16 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          WGG Apex provides operational guidance for Apex Legends account
          enforcement cases. We are not affiliated with Electronic Arts, Respawn
          Entertainment, or any platform holder. Outcomes depend on publisher
          policies; no result is guaranteed.
        </p>
      </div>
    </div>
  );
}

function WorkflowPill({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof FileSearch;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
      <Icon className="size-4 shrink-0 text-primary" aria-hidden />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
