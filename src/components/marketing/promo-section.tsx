"use client";

import Link from "next/link";
import { Tag } from "lucide-react";

import { AnimatedSection } from "@/components/shared/animated-section";
import { Button } from "@/components/ui/button";
import { formatPriceFromCents } from "@/lib/services/format-price";
import type { FeaturedPromo } from "@/types/promo";

type PromoSectionProps = {
  promos: FeaturedPromo[];
};

function promoCheckoutHref(promo: FeaturedPromo): string {
  const code = encodeURIComponent(promo.code);
  if (promo.serviceSlug === "predator-maintenance") {
    return `/services/predator-maintenance?promo=${code}`;
  }
  if (promo.serviceSlug) {
    return `/checkout/${promo.serviceSlug}?promo=${code}`;
  }
  return `/?promo=${code}#services`;
}

export function PromoSection({ promos }: PromoSectionProps) {
  if (promos.length === 0) return null;

  return (
    <AnimatedSection className="border-y border-primary/20 bg-primary/5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Tag className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">
              Limited promo
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {promos.map((promo) => (
                <div key={promo.code}>
                  <p className="font-heading text-lg font-semibold tracking-tight">
                    {promo.description ??
                      `${formatPriceFromCents(promo.discountCents)} off`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Use code{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {promo.code}
                    </span>{" "}
                    at checkout
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Button
          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          render={
            <Link href={promoCheckoutHref(promos[0])} />
          }
        >
          Claim offer
        </Button>
      </div>
    </AnimatedSection>
  );
}
