"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { createCheckoutSession } from "@/actions/checkout/create-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_RANK_OPTIONS } from "@/config/orders";
import { formatPriceFromCents } from "@/lib/services/format-price";
import type { CatalogPricingItem, CatalogService } from "@/types/services";
import type { MarketplaceListing } from "@/types/marketplace";

type CheckoutFormProps =
  | {
      mode: "service";
      service: CatalogService;
      serviceSlug: string;
    }
  | {
      mode: "marketplace";
      listing: MarketplaceListing;
    };

export function CheckoutForm(props: CheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(
    props.mode === "service" && props.service.pricingItems[0]
      ? props.service.pricingItems[0].id
      : ""
  );

  const selectedItem: CatalogPricingItem | null =
    props.mode === "service"
      ? props.service.pricingItems.find((i) => i.id === selectedItemId) ?? null
      : null;

  const amountCents =
    props.mode === "marketplace"
      ? props.listing.priceCents
      : (selectedItem?.priceCents ?? 0);

  const requiresRanks =
    props.mode === "service" &&
    props.service.pricingEngine === "tier_table";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await createCheckoutSession(
      props.mode === "service" ? props.serviceSlug : null,
      {
        customerDiscord: String(formData.get("customerDiscord") ?? ""),
        customerEmail: String(formData.get("customerEmail") ?? "") || null,
        currentRank: String(formData.get("currentRank") ?? "") || null,
        targetRank: String(formData.get("targetRank") ?? "") || null,
        notes: String(formData.get("notes") ?? "") || null,
        pricingItemId:
          props.mode === "service" ? selectedItemId || null : null,
        listingId:
          props.mode === "marketplace" ? props.listing.id : null,
      }
    );

    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    window.location.href = result.url;
  }

  const title =
    props.mode === "service" ? props.service.name : props.listing.title;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[1fr_320px]"
    >
      <div className="space-y-6">
        <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
          <h2 className="font-heading text-lg font-semibold">Your details</h2>

          <div className="space-y-2">
            <Label htmlFor="customerDiscord">Discord username *</Label>
            <Input
              id="customerDiscord"
              name="customerDiscord"
              required
              placeholder="username"
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email (for receipt)</Label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              placeholder="you@email.com"
              className="border-white/10 bg-background/50"
            />
          </div>

          {requiresRanks && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentRank">Current rank *</Label>
                <select
                  id="currentRank"
                  name="currentRank"
                  required
                  className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
                >
                  <option value="">Select…</option>
                  {ORDER_RANK_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetRank">Target rank *</Label>
                <select
                  id="targetRank"
                  name="targetRank"
                  required
                  className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
                >
                  <option value="">Select…</option>
                  {ORDER_RANK_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Platform, duo preference, schedule…"
              className="border-white/10 bg-background/50"
            />
          </div>
        </section>

        {props.mode === "service" &&
          props.service.pricingEngine !== "marketplace" && (
            <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
              <h2 className="font-heading text-lg font-semibold">
                Select option
              </h2>
              <div className="space-y-2">
                {props.service.pricingItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 bg-background/30 px-4 py-3 transition-colors has-checked:border-primary/40 has-checked:bg-primary/5"
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
                      {formatPriceFromCents(item.priceCents)}
                    </span>
                  </label>
                ))}
              </div>
            </section>
          )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="space-y-4 rounded-xl border border-white/5 bg-card/50 p-6">
          <h2 className="font-heading text-lg font-semibold">Order summary</h2>
          <p className="text-sm text-muted-foreground">{title}</p>
          {selectedItem && (
            <p className="text-sm">{selectedItem.name}</p>
          )}
          {props.mode === "marketplace" && (
            <p className="text-sm text-muted-foreground">
              {props.listing.rankLabel} · {props.listing.platform}
            </p>
          )}
          <p className="font-mono text-3xl font-semibold tabular-nums">
            {formatPriceFromCents(amountCents)}
          </p>
          <Button
            type="submit"
            size="lg"
            disabled={loading || amountCents <= 0}
            className="w-full bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Lock className="size-4" data-icon="inline-start" />
            )}
            Continue to secure checkout
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            You will be redirected to Stripe. Card details are never stored on
            WGG servers.
          </p>
        </div>
      </aside>
    </form>
  );
}
