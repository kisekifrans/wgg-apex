import Link from "next/link";
import { Check } from "lucide-react";

import { AnimatedSection } from "@/components/shared/animated-section";
import { RankIcon } from "@/components/shared/rank-icon";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BundleRankSpan } from "@/components/marketing/bundle-rank-span";
import { isMasterPredatorBundleItem } from "@/config/master-predator-pricing";
import { getBundleAdditionalCents } from "@/config/ranked-bundles";
import { formatPriceFromCents } from "@/lib/services/format-price";
import { cn } from "@/lib/utils";
import type { CatalogPricingItem, CatalogService } from "@/types/services";

/** Homepage tables show official bundle tiers only (not configure-at-checkout examples). */
function isOfficialBundleRow(row: CatalogPricingItem): boolean {
  const subtitle = row.subtitle?.toLowerCase() ?? "";
  return !subtitle.includes("example") && !subtitle.includes("configure at checkout");
}

type RankPricingSectionProps = {
  rankedBoost: CatalogService | null;
  selfPlayBoost: CatalogService | null;
  predatorMaintenance: CatalogService | null;
};

export function RankPricingSection({
  rankedBoost,
  selfPlayBoost,
  predatorMaintenance,
}: RankPricingSectionProps) {
  const tiers = (rankedBoost?.pricingItems ?? []).filter(isOfficialBundleRow);
  const duoTiers = (selfPlayBoost?.pricingItems ?? []).filter(isOfficialBundleRow);
  const plans = predatorMaintenance?.pricingItems ?? [];

  return (
    <AnimatedSection
      id="rank-pricing"
      className="border-t border-white/[0.06] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Pricing"
          title="Rank Boosting Pricing"
          description="Official bundle packages with per-rank add-ons. Buy a tier now, or configure your exact rank span at checkout for a custom quote."
        />

        {tiers.length > 0 ? (
          <div className="mt-12 overflow-hidden rounded-xl border border-white/5 bg-card/30">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-5 py-4 font-medium text-muted-foreground">
                      Tier
                    </th>
                    <th className="px-5 py-4 font-medium text-muted-foreground">
                      Bundle package
                    </th>
                    <th className="px-5 py-4 font-medium text-muted-foreground">
                      Price
                    </th>
                    <th className="px-5 py-4 font-medium text-muted-foreground">
                      +/rank
                    </th>
                    <th className="px-5 py-4 font-medium text-muted-foreground">
                      Typical ETA
                    </th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((row) => {
                    const additional = getBundleAdditionalCents(row);
                    return (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <BundleRankSpan item={row} />
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {row.subtitle ?? "Bundle package"}
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold tabular-nums">
                        {isMasterPredatorBundleItem(row)
                          ? `From ${formatPriceFromCents(row.priceCents)}`
                          : formatPriceFromCents(row.priceCents)}
                      </td>
                      <td className="px-5 py-4 font-mono tabular-nums text-muted-foreground">
                        {additional != null
                          ? formatPriceFromCents(additional)
                          : "—"}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {row.etaLabel ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-primary/30 text-primary hover:bg-primary/10"
                          render={
                            <Link
                              href={
                                isMasterPredatorBundleItem(row)
                                  ? "/checkout/ranked-boosting?bundle=master-predator"
                                  : "/checkout/ranked-boosting"
                              }
                            />
                          }
                        >
                          Buy Now
                        </Button>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {duoTiers.length > 0 && (
          <div id="self-play-boosting" className="mt-16 scroll-mt-28">
            <SectionHeader
              eyebrow="Duo Queue"
              title={selfPlayBoost?.name ?? "Duo Ranked Boost"}
              description={
                selfPlayBoost?.shortDescription ??
                "Queue on your own account with a WGG operator—live comms, coordinated drops, and faster climbs than piloted boosting. Priced at double the standard tier rate."
              }
              className="mb-0"
            />

            <div className="mt-8 overflow-hidden rounded-xl border border-primary/20 bg-card/30">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-primary/5">
                      <th className="px-5 py-4 font-medium text-muted-foreground">
                        Tier
                      </th>
                      <th className="px-5 py-4 font-medium text-muted-foreground">
                        Bundle package
                      </th>
                      <th className="px-5 py-4 font-medium text-muted-foreground">
                        Duo rate
                      </th>
                      <th className="px-5 py-4 font-medium text-muted-foreground">
                        Typical ETA
                      </th>
                      <th className="px-5 py-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {duoTiers.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-4">
                          <BundleRankSpan item={row} />
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {row.subtitle ?? "—"}
                        </td>
                        <td className="px-5 py-4 font-mono font-semibold tabular-nums text-primary">
                          {isMasterPredatorBundleItem(row)
                            ? `From ${formatPriceFromCents(row.priceCents)}`
                            : formatPriceFromCents(row.priceCents)}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {row.etaLabel ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-primary/30 text-primary hover:bg-primary/10"
                            render={
                              <Link
                                href={
                                  isMasterPredatorBundleItem(row)
                                    ? "/checkout/self-play-boosting?bundle=master-predator"
                                    : "/checkout/self-play-boosting"
                                }
                              />
                            }
                          >
                            Buy Now
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {plans.length > 0 && (
          <div id="predator-plans" className="mt-16 scroll-mt-28">
            <SectionHeader
              eyebrow="Predator"
              title="Predator Maintenance Plans"
              description="Operators play on Nintendo (Switch); your EA-linked Predator RP and rewards carry over to PC, PlayStation, and Xbox."
              className="mb-0"
            />

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={cn(
                    "border-white/5 bg-card/50",
                    plan.isFeatured &&
                      "border-primary/30 ring-1 ring-primary/20"
                  )}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <RankIcon tier="Predator" size="md" />
                        <CardTitle>{plan.name}</CardTitle>
                      </div>
                      {plan.isFeatured && (
                        <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                        {formatPriceFromCents(plan.priceCents)}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-primary"
                            aria-hidden
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant={plan.isFeatured ? "default" : "outline"}
                      className={cn(
                        "w-full",
                        plan.isFeatured &&
                          "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      render={
                        <Link href="/services/predator-maintenance" />
                      }
                    >
                      Select Plan
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Need a custom span?{" "}
          <Link
            href="mailto:support@wggapex.com"
            className="font-medium text-primary hover:underline"
          >
            Contact Support
          </Link>{" "}
          for a tailored quote.
        </p>
      </div>
    </AnimatedSection>
  );
}
