import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  AnimatedItem,
  AnimatedSection,
  AnimatedStagger,
} from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { badgeServices } from "@/config/platform";
import { cn } from "@/lib/utils";

const difficultyStyles = {
  Standard: "border-white/10 text-muted-foreground",
  Advanced: "border-primary/20 bg-primary/5 text-primary",
  Elite: "border-[var(--brand-gold)]/25 bg-[var(--brand-gold)]/8 text-[var(--brand-gold)]",
};

export function BadgeServicesSection() {
  return (
    <AnimatedSection id="badges" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="Badges"
            title="Badge services"
            description="Fixed-price achievement packages. Select from our catalog or request a custom badge path through support."
          />
          <Button
            variant="ghost"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            render={<Link href="/services/badge-boosting" />}
          >
            Full catalog
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>

        <AnimatedStagger className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badgeServices.map((badge) => (
            <AnimatedItem key={badge.name}>
              <article className="flex h-full flex-col justify-between rounded-xl border border-white/5 bg-card/40 p-5 transition-colors hover:border-white/10 hover:bg-card/60">
                <div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-normal",
                      difficultyStyles[badge.difficulty]
                    )}
                  >
                    {badge.difficulty}
                  </Badge>
                  <h3 className="mt-3 font-medium leading-snug">{badge.name}</h3>
                </div>
                <p className="mt-4 font-mono text-lg font-semibold tabular-nums">
                  ${badge.price}
                </p>
              </article>
            </AnimatedItem>
          ))}
        </AnimatedStagger>

        <div className="mt-10 rounded-xl border border-white/5 bg-white/[0.02] p-6 text-center sm:text-left">
          <p className="text-sm text-muted-foreground">
            Custom badge routes and multi-badge bundles are quoted individually.
            All orders include dashboard tracking and operator verification.
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}
