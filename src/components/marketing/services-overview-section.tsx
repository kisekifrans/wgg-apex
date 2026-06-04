import {
  AnimatedItem,
  AnimatedSection,
  AnimatedStagger,
} from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import { ServiceProductCard } from "@/components/marketing/service-product-card";
import type { CatalogService } from "@/types/services";

type ServicesOverviewSectionProps = {
  featuredService: CatalogService | null;
  services: CatalogService[];
};

export function ServicesOverviewSection({
  featuredService,
  services,
}: ServicesOverviewSectionProps) {
  return (
    <AnimatedSection id="services" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Services"
          title="Premium Apex Services"
          description="Verified operators, clear pricing, and live tracking—no Discord ticket roulette."
        />

        <div className="mt-14 space-y-8">
          {featuredService && (
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
                Most Popular
              </p>
              <AnimatedItem>
                <ServiceProductCard
                  service={featuredService}
                  variant="featured"
                />
              </AnimatedItem>
            </div>
          )}

          {services.length > 0 && (
            <div className={featuredService ? "space-y-6" : undefined}>
              {featuredService && (
                <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                  All Services
                </h3>
              )}
              <AnimatedStagger className="grid gap-6 sm:grid-cols-2">
                {services.map((service) => (
                  <AnimatedItem key={service.id} className="h-full">
                    <ServiceProductCard service={service} variant="standard" />
                  </AnimatedItem>
                ))}
              </AnimatedStagger>
            </div>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}
