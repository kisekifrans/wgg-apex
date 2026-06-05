"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

import { createCheckoutSession } from "@/actions/checkout/create-session";
import { getCheckoutQuote } from "@/actions/checkout/get-quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CHECKOUT_PLATFORMS,
  CHECKOUT_PRIORITIES,
} from "@/config/checkout-options";
import {
  computeKillsFarmingCents,
  formatKillCountLabel,
  getKillsFarmingConfig,
} from "@/config/kills-farming-pricing";
import { ORDER_RANK_OPTIONS } from "@/config/orders";
import { MasterPredatorPricingPanel } from "@/components/checkout/master-predator-pricing-panel";
import { PriceBreakdown } from "@/components/checkout/price-breakdown";
import {
  MASTER_PREDATOR_FROM_RANK,
  MASTER_PREDATOR_TO_RANK,
} from "@/config/master-predator-pricing";
import { formatPriceFromCents } from "@/lib/services/format-price";
import type { CheckoutQuote } from "@/types/checkout";
import type { CatalogPricingItem, CatalogService } from "@/types/services";
import type { MarketplaceListing } from "@/types/marketplace";

type CheckoutFormProps = {
  paymentsEnabled: boolean;
  masterPredatorPreset?: boolean;
  initialPromoCode?: string;
} & (
  | {
      mode: "service";
      service: CatalogService;
      serviceSlug: string;
    }
  | {
      mode: "marketplace";
      listing: MarketplaceListing;
    }
);

export function CheckoutForm({
  paymentsEnabled,
  masterPredatorPreset = false,
  initialPromoCode = "",
  ...props
}: CheckoutFormProps) {
  const mode = props.mode;
  const serviceSlug = mode === "service" ? props.serviceSlug : null;
  const service = mode === "service" ? props.service : null;
  const listing = mode === "marketplace" ? props.listing : null;

  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState(initialPromoCode.trim().toUpperCase());

  const [selectedItemId, setSelectedItemId] = useState(
    service?.pricingItems[0] ? service.pricingItems[0].id : ""
  );
  const [currentRank, setCurrentRank] = useState(
    masterPredatorPreset ? MASTER_PREDATOR_FROM_RANK : ""
  );
  const [targetRank, setTargetRank] = useState(
    masterPredatorPreset ? MASTER_PREDATOR_TO_RANK : ""
  );
  const [platform, setPlatform] = useState(
    masterPredatorPreset ? "xbox" : ""
  );
  const [priority, setPriority] = useState("standard");
  const pricingItems = service?.pricingItems ?? null;

  const killsConfig = useMemo(
    () =>
      serviceSlug === "kills-farming" && pricingItems
        ? getKillsFarmingConfig(pricingItems)
        : null,
    [serviceSlug, pricingItems]
  );
  const [killCount, setKillCount] = useState(
    killsConfig?.minKills ?? 100
  );

  const isKillsFarming = serviceSlug === "kills-farming";

  const isRankedTier =
    serviceSlug === "ranked-boosting" || serviceSlug === "self-play-boosting";

  const requiresRanks =
    service !== null &&
    service.pricingEngine === "tier_table" &&
    isRankedTier;

  const lockedMasterPredator =
    masterPredatorPreset && requiresRanks && isRankedTier;

  const rankPlatforms = lockedMasterPredator
    ? CHECKOUT_PLATFORMS.filter(
        (p) =>
          p.value === "xbox" ||
          p.value === "pc" ||
          p.value === "playstation"
      )
    : CHECKOUT_PLATFORMS;

  const showPricingItems =
    service !== null &&
    service.pricingEngine !== "marketplace" &&
    !requiresRanks &&
    !isKillsFarming;

  const selectedItem: CatalogPricingItem | null =
    service !== null
      ? service.pricingItems.find((i) => i.id === selectedItemId) ?? null
      : null;

  const staticAmountCents =
    listing !== null
      ? listing.priceCents
      : isKillsFarming && killsConfig
        ? computeKillsFarmingCents(killCount, killsConfig)
        : (selectedItem?.priceCents ?? 0);

  const amountCents = quote?.amountCents ?? staticAmountCents;
  const quoteRequestId = useRef(0);
  const minKills = killsConfig?.minKills ?? 100;

  const fetchQuote = useCallback(async () => {
    if (mode === "marketplace") {
      setQuote(null);
      setQuoteError(null);
      setQuoteLoading(false);
      return;
    }

    if (!serviceSlug) return;

    const input = {
      customerDiscord: "quote",
      currentRank: currentRank || null,
      targetRank: targetRank || null,
      platform: platform || null,
      priority: priority || null,
      pricingItemId: requiresRanks || isKillsFarming ? null : selectedItemId || null,
      killCount: isKillsFarming ? killCount : null,
      listingId: null,
      promoCode: promoCode || null,
    };

    if (requiresRanks) {
      if (!currentRank || !targetRank || !platform) {
        setQuote(null);
        setQuoteError(null);
        setQuoteLoading(false);
        return;
      }
    } else if (isKillsFarming) {
      if (!killCount || killCount < minKills) {
        setQuote(null);
        setQuoteError(null);
        setQuoteLoading(false);
        return;
      }
    } else if (!selectedItemId) {
      setQuote(null);
      setQuoteError(null);
      setQuoteLoading(false);
      return;
    }

    const requestId = ++quoteRequestId.current;
    setQuoteLoading(true);

    const result = await getCheckoutQuote(serviceSlug, input);

    if (requestId !== quoteRequestId.current) return;

    setQuoteLoading(false);

    if (result.success) {
      setQuote(result.quote);
      setQuoteError(null);
    } else {
      setQuote(null);
      setQuoteError(result.error);
    }
  }, [
    mode,
    serviceSlug,
    currentRank,
    targetRank,
    platform,
    priority,
    selectedItemId,
    requiresRanks,
    isKillsFarming,
    killCount,
    minKills,
    promoCode,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchQuote();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!paymentsEnabled) {
      toast.error(
        "Payments are not configured. Add PayPal credentials to test checkout."
      );
      return;
    }

    if (amountCents <= 0 || quoteError) {
      toast.error(quoteError ?? "Complete all required fields to get a price.");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await createCheckoutSession(
      mode === "service" ? serviceSlug : null,
      {
        customerDiscord: String(formData.get("customerDiscord") ?? ""),
        customerEmail: String(formData.get("customerEmail") ?? "") || null,
        currentRank: requiresRanks
          ? currentRank
          : String(formData.get("currentRank") ?? "") || null,
        targetRank: requiresRanks
          ? targetRank
          : String(formData.get("targetRank") ?? "") || null,
        notes: String(formData.get("notes") ?? "") || null,
        platform: requiresRanks ? platform : null,
        priority: requiresRanks ? priority : null,
        killCount: isKillsFarming ? killCount : null,
        pricingItemId:
          mode === "service" && !requiresRanks && !isKillsFarming
            ? selectedItemId || null
            : null,
        listingId:
          listing !== null ? listing.listingNumber : null,
        promoCode: promoCode || null,
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
    service !== null ? service.name : (listing?.title ?? "Checkout");

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
            <Label htmlFor="customerEmail">Email *</Label>
            <Input
              id="customerEmail"
              name="customerEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="you@email.com"
              className="border-white/10 bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Used for your confirmation email and order tracking.
            </p>
          </div>

          {lockedMasterPredator && (
            <MasterPredatorPricingPanel
              duoBoost={serviceSlug === "self-play-boosting"}
              selectedPlatform={platform}
            />
          )}

          {requiresRanks && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currentRank">Current rank *</Label>
                  <select
                    id="currentRank"
                    name="currentRank"
                    required
                    value={currentRank}
                    disabled={lockedMasterPredator}
                    onChange={(e) => setCurrentRank(e.target.value)}
                    className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm disabled:opacity-70"
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
                    value={targetRank}
                    disabled={lockedMasterPredator}
                    onChange={(e) => setTargetRank(e.target.value)}
                    className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm disabled:opacity-70"
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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <select
                    id="platform"
                    name="platform"
                    required
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
                  >
                    {!lockedMasterPredator && <option value="">Select…</option>}
                    {rankPlatforms.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  {lockedMasterPredator && (
                    <p className="text-xs text-muted-foreground">
                      Xbox $170 · PC $350 · PlayStation $300
                      {serviceSlug === "self-play-boosting" ? " (duo 2×)" : ""}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    name="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
                  >
                    {CHECKOUT_PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                        {p.multiplier > 1 ? " (+20%)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Schedule, duo preference, region…"
              className="border-white/10 bg-background/50"
            />
          </div>
        </section>

        {isKillsFarming && killsConfig && (
          <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
            <h2 className="font-heading text-lg font-semibold">
              Configure kills
            </h2>
            <p className="text-sm text-muted-foreground">
              Minimum {formatKillCountLabel(killsConfig.minKills)}. Priced at{" "}
              <span className="font-medium text-foreground">$45 per 1,000 kills</span>{" "}
              ({formatPriceFromCents(killsConfig.centsPer100Kills)} per 100).
            </p>

            <div className="flex flex-wrap gap-2">
              {[100, 500, 1000, 2000, 5000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setKillCount(preset)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                    killCount === preset
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-white/10 bg-background/30 text-muted-foreground hover:border-white/20"
                  }`}
                >
                  {formatKillCountLabel(preset)}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="killCount">Custom amount *</Label>
              <Input
                id="killCount"
                name="killCount"
                type="number"
                min={killsConfig.minKills}
                step={killsConfig.killsStep}
                required
                value={killCount}
                onChange={(e) => setKillCount(Number(e.target.value))}
                className="border-white/10 bg-background/50 font-mono tabular-nums"
              />
              <p className="text-xs text-muted-foreground">
                Increments of {killsConfig.killsStep} kills.
              </p>
            </div>
          </section>
        )}

        {showPricingItems && (
          <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
            <h2 className="font-heading text-lg font-semibold">
              Select option
            </h2>
            <div className="space-y-2">
              {mode === "service" &&
                service.pricingItems.map((item) => (
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
          {quote?.lineItemDescription && (
            <p className="text-sm text-muted-foreground">
              {quote.lineItemDescription}
            </p>
          )}
          {isKillsFarming && (
            <p className="text-sm">{formatKillCountLabel(killCount)}</p>
          )}
          {selectedItem && !requiresRanks && !isKillsFarming && (
            <p className="text-sm">{selectedItem.name}</p>
          )}
          {listing !== null && (
            <p className="text-sm text-muted-foreground">
              {listing.rankLabel} · {listing.platform}
            </p>
          )}

          {mode === "service" ? (
            <div className="space-y-2">
              <Label htmlFor="promoCode">Promo code</Label>
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
          ) : null}

          <PriceBreakdown quote={quote} loading={quoteLoading} />

          {quoteError && (
            <p className="text-xs text-destructive">{quoteError}</p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={
              loading ||
              (quoteLoading && !quote) ||
              amountCents <= 0 ||
              !!quoteError ||
              !paymentsEnabled
            }
            className="w-full bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            ) : (
              <Lock className="size-4" data-icon="inline-start" />
            )}
            {paymentsEnabled ? "Continue to Secure Checkout" : "Checkout Unavailable"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {paymentsEnabled
              ? "You will be redirected to PayPal. Payment details are never stored on WGG servers."
              : "Configure PayPal sandbox credentials in .env.local to try the full payment flow."}
          </p>
        </div>
      </aside>
    </form>
  );
}
