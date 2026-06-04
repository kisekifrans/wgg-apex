import Link from "next/link";
import { Check } from "lucide-react";

import { AnimatedSection } from "@/components/shared/animated-section";
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
import {
  predatorMaintenancePlans,
  rankPricingTiers,
} from "@/config/platform";
import { cn } from "@/lib/utils";

export function RankPricingSection() {
  return (
    <AnimatedSection
      id="rank-pricing"
      className="border-t border-white/5 bg-[#0F0F12]/40 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Pricing"
          title="Rank boosting pricing"
          description="Published starting rates by tier. Final quotes account for division span, platform, duo options, and express priority—confirmed before checkout."
        />

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
                {rankPricingTiers.map((row) => (
                  <tr
                    key={row.tier}
                    className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4 font-medium">{row.tier}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {row.divisions}
                    </td>
                    <td className="px-5 py-4 font-mono tabular-nums font-semibold">
                      ${row.fromPrice}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {row.eta}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href="/order/ranked-boosting"
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

        <div className="mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow="Predator"
              title="Predator maintenance plans"
              description="Weekly plans for players who need RP held—not a one-time push."
              className="mb-0"
            />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {predatorMaintenancePlans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "border-white/5 bg-card/50",
                  "featured" in plan &&
                    plan.featured &&
                    "border-primary/30 ring-1 ring-primary/20"
                )}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {"featured" in plan && plan.featured && (
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardDescription>
                    <span className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      {plan.period}
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
                    variant={
                      "featured" in plan && plan.featured
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "w-full",
                      "featured" in plan &&
                        plan.featured &&
                        "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                    render={
                      <Link href="/order/predator-maintenance" />
                    }
                  >
                    Select plan
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Need a custom span?{" "}
          <Link
            href="mailto:support@wggapex.com"
            className="font-medium text-primary hover:underline"
          >
            Contact operations
          </Link>{" "}
          for a tailored quote.
        </p>
      </div>
    </AnimatedSection>
  );
}
