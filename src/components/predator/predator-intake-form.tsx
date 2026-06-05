"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { createCheckoutSession } from "@/actions/checkout/create-session";
import { getCheckoutQuote } from "@/actions/checkout/get-quote";
import { PriceBreakdown } from "@/components/checkout/price-breakdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  eaBackupCodeGuide,
  nintendoAccountGuide,
  nintendoBackupCodeGuide,
} from "@/config/predator-maintenance";
import {
  computePredatorPlanPriceCents,
  parsePredatorPlatformPricing,
  PREDATOR_PLATFORMS,
} from "@/config/predator-platform-pricing";
import type { CheckoutPlatform } from "@/config/checkout-options";
import { formatPriceFromCents } from "@/lib/services/format-price";
import { cn } from "@/lib/utils";
import type { CheckoutQuote } from "@/types/checkout";
import type { CatalogPricingItem, CatalogService } from "@/types/services";

type PredatorIntakeFormProps = {
  service: CatalogService;
  paymentsEnabled: boolean;
  initialPromoCode?: string;
};

export function PredatorIntakeForm({
  service,
  paymentsEnabled,
  initialPromoCode = "",
}: PredatorIntakeFormProps) {
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [platform, setPlatform] = useState("switch");
  const [selectedItemId, setSelectedItemId] = useState(
    service.pricingItems.find((i) => i.isFeatured)?.id ??
      service.pricingItems[0]?.id ??
      ""
  );
  const [promoCode, setPromoCode] = useState(
    initialPromoCode.trim().toUpperCase()
  );

  const selectedItem: CatalogPricingItem | null =
    service.pricingItems.find((i) => i.id === selectedItemId) ?? null;

  const platformPricing = parsePredatorPlatformPricing(service.displayConfig);
  const selectedPlatform = platform as CheckoutPlatform;

  function planPriceCents(planName: string): number {
    return computePredatorPlanPriceCents(
      planName,
      selectedPlatform,
      platformPricing
    );
  }

  const fetchQuote = useCallback(async () => {
    if (!selectedItemId) {
      setQuote(null);
      return;
    }
    setQuoteLoading(true);
    const result = await getCheckoutQuote("predator-maintenance", {
      customerDiscord: "quote",
      pricingItemId: selectedItemId,
      platform,
      promoCode: promoCode || null,
    });
    setQuoteLoading(false);
    if (result.success) {
      setQuote(result.quote);
      setQuoteError(null);
    } else {
      setQuote(null);
      setQuoteError(result.error);
    }
  }, [selectedItemId, platform, promoCode]);

  useEffect(() => {
    const timer = setTimeout(() => void fetchQuote(), 200);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    if (!paymentsEnabled) {
      const message =
        "Payments are not configured yet. Contact support to complete your order.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!selectedItemId) {
      const message = "Please select a maintenance plan.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!acknowledged) {
      const message =
        "Please confirm Nintendo platform access and credential sharing to continue.";
      setFormError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await createCheckoutSession("predator-maintenance", {
        customerDiscord: String(formData.get("customerDiscord") ?? ""),
        currentRank: String(formData.get("currentRank") ?? ""),
        pricingItemId: selectedItemId,
        platform,
        predatorDetails: {
          nintendoEmail: String(formData.get("nintendoEmail") ?? ""),
          nintendoPassword: String(formData.get("nintendoPassword") ?? ""),
          nintendoBackupCode: String(formData.get("nintendoBackupCode") ?? ""),
          eaEmail: String(formData.get("eaEmail") ?? ""),
          eaPassword: String(formData.get("eaPassword") ?? ""),
          eaBackupCode: String(formData.get("eaBackupCode") ?? ""),
        },
        promoCode: promoCode || null,
      });

      if (!result.success) {
        setFormError(result.error);
        toast.error(result.error);
        setLoading(false);
        return;
      }

      window.location.href = result.url;
    } catch {
      const message = "Checkout failed unexpectedly. Please try again.";
      setFormError(message);
      toast.error(message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-white/5 bg-card/40 p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold">
          Before you continue
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Read the requirements below. Expand each guide if you need step-by-step
          help creating your Nintendo Account or backup codes.
        </p>

        <Accordion className="mt-6 divide-y divide-white/5 rounded-xl border border-white/5 bg-background/30 px-4">
          <AccordionItem value="nintendo-account">
            <AccordionTrigger className="py-4 hover:no-underline">
              {nintendoAccountGuide.title}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-4">
                {nintendoAccountGuide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <a
                href={nintendoAccountGuide.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                {nintendoAccountGuide.link.label}
              </a>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="nintendo-backup">
            <AccordionTrigger className="py-4 hover:no-underline">
              {nintendoBackupCodeGuide.title}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-4">
                {nintendoBackupCodeGuide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ea-backup">
            <AccordionTrigger className="py-4 hover:no-underline">
              {eaBackupCodeGuide.title}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <ol className="list-decimal space-y-2 pl-4">
                {eaBackupCodeGuide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <a
                href={eaBackupCodeGuide.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
              >
                {eaBackupCodeGuide.link.label}
              </a>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section className="rounded-2xl border border-white/5 bg-card/40 p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold">Account access</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Required for Nintendo (Switch) Predator maintenance. Credentials are
          encrypted in transit and visible only to assigned WGG operators.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="customerDiscord">Discord username *</Label>
            <Input
              id="customerDiscord"
              name="customerDiscord"
              required
              placeholder="For operator updates"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="currentRank">Current rank / RP band *</Label>
            <Input
              id="currentRank"
              name="currentRank"
              required
              placeholder="e.g. Master · 15,000 RP"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nintendoEmail">Nintendo account email *</Label>
            <Input
              id="nintendoEmail"
              name="nintendoEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="Email for accounts.nintendo.com"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nintendoPassword">Nintendo account password *</Label>
            <Input
              id="nintendoPassword"
              name="nintendoPassword"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Nintendo account password"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nintendoBackupCode">Nintendo backup login code *</Label>
            <Input
              id="nintendoBackupCode"
              name="nintendoBackupCode"
              required
              autoComplete="off"
              placeholder="From accounts.nintendo.com"
              className="border-white/10 bg-background/50 font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eaEmail">EA email *</Label>
            <Input
              id="eaEmail"
              name="eaEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="EA account email"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eaPassword">EA password *</Label>
            <Input
              id="eaPassword"
              name="eaPassword"
              type="password"
              required
              autoComplete="current-password"
              placeholder="EA account password"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="eaBackupCode">EA backup code *</Label>
            <Input
              id="eaBackupCode"
              name="eaBackupCode"
              required
              autoComplete="off"
              placeholder="From myaccount.ea.com security settings"
              className="border-white/10 bg-background/50 font-mono text-sm"
            />
          </div>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <Checkbox
            checked={acknowledged}
            onCheckedChange={(v) => setAcknowledged(v === true)}
          />
          <span className="text-sm leading-relaxed text-muted-foreground">
            I confirm this order is for{" "}
            <strong className="text-foreground">Nintendo (Switch)</strong>, I have
            or will create a Nintendo Account, and I authorize WGG operators to
            use the credentials above for Predator maintenance while I am away.
          </span>
        </label>
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
        <p className="text-sm leading-relaxed text-amber-100/90">
          <strong className="text-amber-200">Nintendo notice:</strong> Predator
          Maintenance on Nintendo starts from{" "}
          <strong className="text-foreground">Rookie</strong> rank progression.
        </p>
      </section>

      <section className="rounded-2xl border border-white/5 bg-card/40 p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold">Platform</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Nintendo (Switch) is the default and lowest-cost option. PC, Xbox, and
          PlayStation are available on request.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PREDATOR_PLATFORMS.map((p) => (
            <label
              key={p.value}
              className={cn(
                "flex cursor-pointer flex-col rounded-lg border border-white/10 bg-background/30 px-4 py-3 transition-colors",
                platform === p.value && "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="platform"
                  value={p.value}
                  checked={platform === p.value}
                  onChange={() => setPlatform(p.value)}
                  className="accent-primary"
                />
                <span className="font-medium">{p.label}</span>
              </div>
              <span className="mt-1 pl-6 text-xs text-muted-foreground">
                {p.description}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-card/40 p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold">Select Plan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Core · Elite · Pro — prices update for the platform selected above
          (before 4% processing fee).
        </p>
        <div className="mt-4 space-y-2">
          {service.pricingItems.map((item) => (
            <label
              key={item.id}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-background/30 px-4 py-3 transition-colors",
                selectedItemId === item.id &&
                  "border-primary/40 bg-primary/5"
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="pricingItem"
                  value={item.id}
                  checked={selectedItemId === item.id}
                  onChange={() => setSelectedItemId(item.id)}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.subtitle && (
                    <p className="text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
              <span className="font-mono font-semibold tabular-nums">
                {formatPriceFromCents(planPriceCents(item.name))}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/5 bg-card/40 p-6 sm:p-8">
        <h2 className="font-heading text-lg font-semibold">Promo code</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Have a discount code? Enter it here before checkout.
        </p>
        <div className="mt-4 max-w-sm space-y-2">
          <Label htmlFor="promoCode">Code</Label>
          <Input
            id="promoCode"
            name="promoCode"
            value={promoCode}
            onChange={(e) =>
              setPromoCode(e.target.value.toUpperCase().replace(/\s/g, ""))
            }
            placeholder="PREDATOR20"
            className="border-white/10 bg-background/50 font-mono uppercase"
          />
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-card/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {formError ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {formError}
            </p>
          ) : null}
          <PriceBreakdown quote={quote} loading={quoteLoading} />
          {quoteError ? (
            <p className="text-xs text-destructive">{quoteError}</p>
          ) : null}
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading || !paymentsEnabled || !selectedItem}
          className="min-w-[220px] bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Lock className="size-4" data-icon="inline-start" />
          )}
          Proceed to Secure Checkout
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        PayPal-hosted checkout · Payment details never stored on WGG servers
      </p>
    </form>
  );
}
