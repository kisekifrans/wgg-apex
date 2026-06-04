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
import { formatPriceFromCents } from "@/lib/services/format-price";
import { cn } from "@/lib/utils";
import type { CatalogService } from "@/types/services";

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
  const tiers = rankedBoost?.pricingItems ?? [];
  const duoTiers = selfPlayBoost?.pricingItems ?? [];
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
          description="Starting rates by tier. Final price reflects division span, platform, duo options, and express priority—locked in before you pay."
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
                      Scope
                    </th>
                    <th className="px-5 py-4 font-medium text-muted-foreground">
                      From
                    </th>
                    <th className="px-5 py-4 font-medium text-muted-foreground">
                      Typical ETA
                    </th>
                    <th className="px-5 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 font-medium">
                          <RankIcon tier={row.name} size="md" />
                          <span>{row.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {row.subtitle ?? "—"}
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold tabular-nums">
                        {formatPriceFromCents(row.priceCents)}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {row.etaLabel ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href="/checkout/ranked-boosting"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Configure
                        </Link>
                      </td>
                    </tr>
                  ))}
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
                        Scope
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
                          <div className="flex items-center gap-3 font-medium">
                            <RankIcon tier={row.name} size="md" />
                            <span>{row.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {row.subtitle ?? "—"}
                        </td>
                        <td className="px-5 py-4 font-mono font-semibold tabular-nums text-primary">
                          {formatPriceFromCents(row.priceCents)}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {row.etaLabel ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            href="/checkout/self-play-boosting"
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Configure
                          </Link>
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
              description="Weekly plans for players who need RP held—not a one-time push."
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
                      {plan.subtitle && (
                        <span className="text-muted-foreground">
                          {" "}
                          {plan.subtitle}
                        </span>
                      )}
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
