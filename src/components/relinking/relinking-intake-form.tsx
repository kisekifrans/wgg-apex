"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { createCheckoutSession } from "@/actions/checkout/create-session";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { relinkingServiceNotices } from "@/config/relinking-service";
import { formatPriceFromCents } from "@/lib/services/format-price";
import type { RelinkingPlatform } from "@/types/relinking";
import type { CatalogPricingItem, CatalogService } from "@/types/services";

const PLATFORM_OPTIONS: { value: RelinkingPlatform; label: string }[] = [
  { value: "ea", label: "EA" },
  { value: "psn", label: "PSN (PlayStation)" },
  { value: "xbox", label: "Xbox" },
  { value: "steam", label: "Steam" },
];

type RelinkingIntakeFormProps = {
  service: CatalogService;
  pricingItem: CatalogPricingItem;
  paymentsEnabled: boolean;
};

export function RelinkingIntakeForm({
  service,
  pricingItem,
  paymentsEnabled,
}: RelinkingIntakeFormProps) {
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [platform, setPlatform] = useState<RelinkingPlatform>("steam");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!acknowledged) {
      toast.error("Please acknowledge the non-refundable policy to continue.");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const result = await createCheckoutSession("relinking", {
      customerDiscord: String(formData.get("customerDiscord") ?? ""),
      pricingItemId: pricingItem.id,
      relinkingDetails: {
        platform,
        accountId: String(formData.get("accountId") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        backupCode: String(formData.get("backupCode") ?? ""),
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
        <h2 className="font-heading text-lg font-semibold">Your details</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Password and backup code are encrypted before storage and visible only
          to assigned WGG operators.
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
            <Label>Platform *</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {PLATFORM_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-background/30 px-4 py-3 has-checked:border-primary/40 has-checked:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="platform"
                    value={opt.value}
                    checked={platform === opt.value}
                    onChange={() => setPlatform(opt.value)}
                    className="accent-primary"
                    required
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="accountId">Account ID *</Label>
            <Input
              id="accountId"
              name="accountId"
              required
              autoComplete="off"
              placeholder="EA ID, PSN online ID, Xbox gamertag, or Steam ID"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Account email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email on the platform or EA account"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backupCode">Backup code *</Label>
            <Input
              id="backupCode"
              name="backupCode"
              required
              autoComplete="off"
              placeholder="Platform or EA backup / 2FA code"
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
            I understand relinking is not guaranteed to succeed and I accept the{" "}
            <strong className="text-foreground">
              {relinkingServiceNotices.refundPolicy.title.toLowerCase()}
            </strong>
            : {relinkingServiceNotices.refundPolicy.description}
          </span>
        </label>
      </section>

      <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-card/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{service.name}</p>
          <p className="font-mono text-2xl font-semibold tabular-nums">
            {formatPriceFromCents(pricingItem.priceCents)}
          </p>
          <p className="text-xs text-muted-foreground">
            + 4% processing fee at checkout
          </p>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading || !paymentsEnabled}
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
    </form>
  );
}
