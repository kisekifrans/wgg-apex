import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  AnimatedItem,
  AnimatedSection,
  AnimatedStagger,
} from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { platformServices } from "@/config/platform";

export function ServicesOverviewSection() {
  return (
    <AnimatedSection id="services" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Services"
          title="Services overview"
          description="Five dedicated product lines for ranked progression, Predator retention, achievements, account recovery, and verified acquisitions."
        />

        <AnimatedStagger className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platformServices.map((service) => {
            const Icon = service.icon;

            return (
              <AnimatedItem key={service.slug}>
                <Link href={service.href} className="group block h-full">
                  <Card className="flex h-full flex-col border-white/5 bg-card/50 transition-all duration-300 hover:border-primary/20 hover:bg-card/80">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary transition-colors group-hover:border-primary/30 group-hover:bg-primary/10">
                          <Icon className="size-5" aria-hidden />
                        </div>
                        {service.slug === "account-marketplace" && (
                          <Badge
                            variant="outline"
                            className="border-white/10 font-normal"
                          >
                            Marketplace
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="mt-4 text-lg">
                        {service.name}
                      </CardTitle>
                      <CardDescription className="leading-relaxed text-muted-foreground">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                      <p className="text-sm text-muted-foreground">
                        {service.fromPrice !== null ? (
                          <>
                            From{" "}
                            <span className="font-mono text-base font-semibold tabular-nums text-foreground">
                              ${service.fromPrice}
                            </span>
                            {service.priceLabel ?? ""}
                          </>
                        ) : (
                          <span className="font-medium text-foreground">
                            {service.priceLabel}
                          </span>
                        )}
                      </p>
                      <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        View
                        <ArrowRight className="size-4" aria-hidden />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedItem>
            );
          })}
        </AnimatedStagger>
      </div>
    </AnimatedSection>
  );
}
