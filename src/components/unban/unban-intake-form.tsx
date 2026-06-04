"use client";

import { useState } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { createCheckoutSession } from "@/actions/checkout/create-session";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { unbanServiceNotices } from "@/config/unban-service";
import { formatPriceFromCents } from "@/lib/services/format-price";
import type { CatalogPricingItem, CatalogService } from "@/types/services";

const APPEAL_OPTIONS = [
  { value: "none", label: "No previous appeals" },
  { value: "one", label: "One previous appeal" },
  { value: "multiple", label: "Two or more appeals" },
  { value: "unknown", label: "Unsure / prefer to explain below" },
] as const;

type UnbanIntakeFormProps = {
  service: CatalogService;
  pricingItem: CatalogPricingItem;
  stripeEnabled: boolean;
};

export function UnbanIntakeForm({
  service,
  pricingItem,
  stripeEnabled,
}: UnbanIntakeFormProps) {
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!acknowledged) {
      toast.error("Please acknowledge the non-refundable policy to continue.");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const appealsValue = String(formData.get("previousAppeals") ?? "");
    const appealsDetail = String(formData.get("appealsDetail") ?? "").trim();
    const previousAppeals =
      appealsValue === "unknown" || appealsDetail
        ? [APPEAL_OPTIONS.find((o) => o.value === appealsValue)?.label, appealsDetail]
            .filter(Boolean)
            .join(" — ")
        : APPEAL_OPTIONS.find((o) => o.value === appealsValue)?.label ?? appealsValue;

    const result = await createCheckoutSession("apex-unban", {
      customerDiscord: String(formData.get("customerDiscord") ?? ""),
      pricingItemId: pricingItem.id,
      unbanDetails: {
        eaLoginId: String(formData.get("eaLoginId") ?? ""),
        eaEmail: String(formData.get("eaEmail") ?? ""),
        banDate: String(formData.get("banDate") ?? ""),
        previousAppeals,
        additionalNotes: String(formData.get("additionalNotes") ?? "") || null,
      },
    });

    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    window.location.href = result.url;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-white/5 bg-card/40 p-6 sm:p-8">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <ShieldCheck className="size-5 text-primary" aria-hidden />
          <h2 className="font-heading text-lg font-semibold">
            Case intake form
          </h2>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Information is encrypted in transit and shared only with WGG operators
          handling your case. Use the email tied to your EA account.
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

          <div className="space-y-2">
            <Label htmlFor="eaLoginId">EA Login ID *</Label>
            <Input
              id="eaLoginId"
              name="eaLoginId"
              required
              autoComplete="username"
              placeholder="EA account username"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eaEmail">EA account email *</Label>
            <Input
              id="eaEmail"
              name="eaEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="name@email.com"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banDate">Ban date *</Label>
            <Input
              id="banDate"
              name="banDate"
              type="date"
              required
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousAppeals">Previous appeals *</Label>
            <select
              id="previousAppeals"
              name="previousAppeals"
              required
              defaultValue=""
              className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
            >
              <option value="" disabled>
                Select…
              </option>
              {APPEAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="appealsDetail">
              Appeal history details (if applicable)
            </Label>
            <Textarea
              id="appealsDetail"
              name="appealsDetail"
              rows={3}
              placeholder="Dates, outcomes, or EA responses from prior appeals…"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="additionalNotes">Additional notes</Label>
            <Textarea
              id="additionalNotes"
              name="additionalNotes"
              rows={4}
              placeholder="Ban reason shown in-game, platform (Steam/Origin), region, linked accounts…"
              className="border-white/10 bg-background/50"
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <div className="flex items-start gap-3">
          <Checkbox
            id="policyAck"
            checked={acknowledged}
            onCheckedChange={(v) => setAcknowledged(v === true)}
          />
          <Label htmlFor="policyAck" className="cursor-pointer font-normal leading-relaxed text-sm">
            I understand the{" "}
            <span className="font-medium text-foreground">
              {unbanServiceNotices.refundPolicy.title.toLowerCase()}
            </span>
            : {unbanServiceNotices.refundPolicy.description}
          </Label>
        </div>
      </section>

      <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-card/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{service.name}</p>
          <p className="font-mono text-3xl font-semibold tabular-nums tracking-tight">
            {formatPriceFromCents(pricingItem.priceCents)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            One-time case review & workflow fee
          </p>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading || !stripeEnabled}
          className="h-12 min-w-[220px] bg-primary px-8 text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Lock className="size-4" data-icon="inline-start" />
          )}
          Proceed to secure checkout
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Stripe-hosted checkout · Card details never stored on WGG servers
      </p>
    </form>
  );
}
