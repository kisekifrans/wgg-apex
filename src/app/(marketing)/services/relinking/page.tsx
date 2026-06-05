import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Link2, Shield } from "lucide-react";

import { PaymentPreviewNotice } from "@/components/checkout/payment-preview-notice";
import { RelinkingIntakeForm } from "@/components/relinking/relinking-intake-form";
import { RelinkingNoticeCards } from "@/components/relinking/relinking-notice-cards";
import { Button } from "@/components/ui/button";
import { relinkingProcessSteps } from "@/config/relinking-service";
import { getServiceBySlug } from "@/lib/db/services-catalog";
import { getPayPalEnv } from "@/lib/paypal/env";
import { formatPriceFromCents } from "@/lib/services/format-price";

export const metadata = {
  title: "Account Relinking",
  description:
    "Remove a PSN, Xbox, or Steam link from your EA account. Secure checkout with encrypted credentials.",
};

export default async function RelinkingServicePage() {
  let service: Awaited<ReturnType<typeof getServiceBySlug>> = null;

  try {
    service = await getServiceBySlug("relinking", true);
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
    <div className="relative overflow-hidden pb-24 pt-28">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-8 text-muted-foreground"
          render={<Link href="/#services" />}
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back to services
        </Button>

        <header className="max-w-3xl">
          <p className="text-sm font-medium tracking-wide text-[var(--brand-gold)]">
            Platform linking
          </p>
          <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {service.name}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {service.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono font-semibold text-primary">
              {formatPriceFromCents(pricingItem.priceCents)}
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Shield className="size-4 text-primary" aria-hidden />
              Encrypted credential handling
            </span>
          </div>
        </header>

        <div className="mt-12">
          <RelinkingNoticeCards />
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-2">
            <h2 className="font-heading text-xl font-semibold">How it works</h2>
            <ol className="mt-6 space-y-6">
              {relinkingProcessSteps.map((step) => (
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

            <div className="mt-10 flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
              <Link2 className="size-4 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium">Relinking from</p>
                <p className="text-xs text-muted-foreground">
                  Remove PSN, Xbox, or Steam links
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-3">
            {!isCheckoutConfigured && <PaymentPreviewNotice />}
            <RelinkingIntakeForm
              service={service}
              pricingItem={pricingItem}
              paymentsEnabled={isCheckoutConfigured}
            />
          </div>
        </div>

        <p className="mt-16 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          WGG Apex is not affiliated with Electronic Arts, Valve, Microsoft,
          Sony, or any platform holder. Relinking outcomes depend on publisher
          and platform policies; success is not guaranteed and refunds are not
          offered after work has started.
        </p>
      </div>
    </div>
  );
}
