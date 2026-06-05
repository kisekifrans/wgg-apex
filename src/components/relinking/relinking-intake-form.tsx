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
import {
  RELINKING_PLATFORM_LABELS,
  type RelinkingPlatform,
} from "@/types/relinking";
import type { CatalogPricingItem, CatalogService } from "@/types/services";

const PLATFORM_OPTIONS: RelinkingPlatform[] = ["psn", "xbox", "steam"];

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
        eaAccount: String(formData.get("eaAccount") ?? ""),
        eaEmail: String(formData.get("eaEmail") ?? ""),
        eaPassword: String(formData.get("eaPassword") ?? ""),
        eaBackupCode: String(formData.get("eaBackupCode") ?? ""),
        steamId: String(formData.get("steamId") ?? ""),
        steamPassword: String(formData.get("steamPassword") ?? ""),
        xboxEmail: String(formData.get("xboxEmail") ?? ""),
        xboxPassword: String(formData.get("xboxPassword") ?? ""),
        psnEmail: String(formData.get("psnEmail") ?? ""),
        psnPassword: String(formData.get("psnPassword") ?? ""),
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
          We remove the selected platform link from your EA account. EA and
          platform passwords are encrypted before storage and visible only to
          assigned WGG operators.
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
            <Label htmlFor="eaAccount">EA account *</Label>
            <Input
              id="eaAccount"
              name="eaAccount"
              required
              autoComplete="off"
              placeholder="Your EA ID or username"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="eaEmail">EA email *</Label>
            <Input
              id="eaEmail"
              name="eaEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="Email on your EA account"
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
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eaBackupCode">EA backup code *</Label>
            <Input
              id="eaBackupCode"
              name="eaBackupCode"
              required
              autoComplete="off"
              placeholder="EA backup / 2FA code"
              className="border-white/10 bg-background/50 font-mono text-sm"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Relinking from *</Label>
            <p className="text-xs text-muted-foreground">
              Which PSN, Xbox, or Steam link should we remove from your EA
              account?
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {PLATFORM_OPTIONS.map((value) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-background/30 px-4 py-3 has-checked:border-primary/40 has-checked:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="platform"
                    value={value}
                    checked={platform === value}
                    onChange={() => setPlatform(value)}
                    className="accent-primary"
                    required
                  />
                  <span className="text-sm font-medium">
                    {RELINKING_PLATFORM_LABELS[value]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div key={platform} className="space-y-5 sm:col-span-2">
            <div>
              <h3 className="text-sm font-medium">
                {RELINKING_PLATFORM_LABELS[platform]} credentials
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Login for the linked {RELINKING_PLATFORM_LABELS[platform]}{" "}
                account we are removing.
              </p>
            </div>

            {platform === "steam" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="steamId">Steam ID *</Label>
                  <Input
                    id="steamId"
                    name="steamId"
                    required
                    autoComplete="off"
                    placeholder="Your Steam ID or profile URL"
                    className="border-white/10 bg-background/50"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="steamPassword">Steam password *</Label>
                  <Input
                    id="steamPassword"
                    name="steamPassword"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="border-white/10 bg-background/50"
                  />
                </div>
              </div>
            )}

            {platform === "xbox" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="xboxEmail">Xbox email *</Label>
                  <Input
                    id="xboxEmail"
                    name="xboxEmail"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Microsoft account email"
                    className="border-white/10 bg-background/50"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="xboxPassword">Xbox password *</Label>
                  <Input
                    id="xboxPassword"
                    name="xboxPassword"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="border-white/10 bg-background/50"
                  />
                </div>
              </div>
            )}

            {platform === "psn" && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="psnEmail">PSN email *</Label>
                  <Input
                    id="psnEmail"
                    name="psnEmail"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="PlayStation account email"
                    className="border-white/10 bg-background/50"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="psnPassword">PSN password *</Label>
                  <Input
                    id="psnPassword"
                    name="psnPassword"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="border-white/10 bg-background/50"
                  />
                </div>
              </div>
            )}
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
