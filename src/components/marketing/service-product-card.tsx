"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { BadgeCatalogThumb } from "@/components/marketing/badge-catalog-thumb";
import { RankIcon } from "@/components/shared/rank-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getServiceArtworkPath } from "@/config/brand-assets";
import { formatPriceFromCents } from "@/lib/services/format-price";
import { cn } from "@/lib/utils";
import type { CatalogService } from "@/types/services";

type ServiceProductCardProps = {
  service: CatalogService;
  variant?: "featured" | "standard";
};

const SLUG_VISUAL: Record<
  string,
  { rank?: string; badgeName?: string; gradient: string }
> = {
  "predator-maintenance": {
    rank: "Predator",
    gradient: "from-[#991b1b]/30 via-card to-[#0a0a0a]",
  },
  "self-play-boosting": {
    rank: "Diamond",
    gradient: "from-primary/20 via-card to-[#0a0a0a]",
  },
  "badge-boosting": {
    badgeName: "20 Kill Badge",
    gradient: "from-primary/15 via-card to-[#0a0a0a]",
  },
  "apex-unban": {
    gradient: "from-zinc-800/80 via-card to-[#0a0a0a]",
  },
  "account-marketplace": {
    gradient: "from-[#1c1c1c] via-card to-[#0a0a0a]",
  },
};

export function ServiceProductCard({
  service,
  variant = "standard",
}: ServiceProductCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0, active: false });

  const artwork = getServiceArtworkPath(service.slug, service.displayConfig);
  const visual = SLUG_VISUAL[service.slug];
  const isFeatured = variant === "featured";
  const priceFormatted = formatPriceFromCents(service.fromPriceCents);
  const href = service.href.startsWith("/") ? service.href : service.href;
  const description =
    service.shortDescription ?? service.description ?? "";

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      setPointer({ x, y, active: true });
    },
    [prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    setPointer({ x: 0, y: 0, active: false });
  }, []);

  const parallaxX = pointer.x * (isFeatured ? 10 : 6);
  const parallaxY = pointer.y * (isFeatured ? 8 : 5);
  const liftY = pointer.active && !prefersReducedMotion ? -6 : 0;

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group/card relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card/60 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.85)] transition-[transform,box-shadow,border-color] duration-500 ease-out",
        isFeatured
          ? "min-h-[24rem] border-primary/25 ring-1 ring-primary/20 lg:min-h-[26rem] lg:flex-row hover:border-primary/50 hover:shadow-[0_40px_80px_-24px_rgba(249,115,22,0.35)]"
          : "min-h-[22rem] border-white/[0.08] hover:border-primary/35 hover:shadow-[0_32px_64px_-20px_rgba(249,115,22,0.22)]"
      )}
      style={{
        transform: prefersReducedMotion
          ? undefined
          : `translate3d(0, ${liftY}px, 0)`,
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px z-0 rounded-2xl bg-gradient-to-br from-primary/50 via-primary/10 to-[var(--brand-gold)]/30 opacity-0 blur-md transition-opacity duration-500 group-hover/card:opacity-70"
        aria-hidden
      />

      <div
        className={cn(
          "relative overflow-hidden",
          isFeatured
            ? "h-52 shrink-0 sm:h-60 lg:h-auto lg:min-h-full lg:w-[58%]"
            : "h-44 shrink-0 sm:h-52"
        )}
      >
        {artwork ? (
          <div
            className="absolute inset-0 overflow-hidden"
            style={
              prefersReducedMotion
                ? undefined
                : {
                    transform: `translate3d(${parallaxX}px, ${parallaxY}px, 0)`,
                  }
            }
          >
            <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover/card:scale-[1.08]">
              <Image
                src={artwork}
                alt={service.name}
                fill
                sizes={
                  isFeatured
                    ? "(max-width: 1024px) 100vw, 58vw"
                    : "(max-width: 768px) 100vw, 50vw"
                }
                className="object-cover object-center"
                priority={isFeatured}
              />
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              visual?.gradient ?? "from-card via-muted to-[#0a0a0a]"
            )}
          >
            <div className="flex h-full items-center justify-center gap-3 p-8">
              {visual?.rank && (
                <RankIcon tier={visual.rank} size="lg" className="size-20" />
              )}
              {visual?.badgeName && (
                <BadgeCatalogThumb
                  name={visual.badgeName}
                  className="size-20 rounded-xl"
                />
              )}
              {!visual?.rank && !visual?.badgeName && (
                <div className="size-20 rounded-2xl border border-white/10 bg-white/5" />
              )}
            </div>
          </div>
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/75 to-[#0a0a0a]/15"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-transparent opacity-60 mix-blend-soft-light transition-opacity duration-500 group-hover/card:opacity-90"
          aria-hidden
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
          aria-hidden
        />

        {isFeatured && (
          <Badge className="absolute left-4 top-4 z-10 border-primary/40 bg-primary/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-[0_0_20px_-4px_rgba(249,115,22,0.6)] hover:bg-primary/20">
            Most Popular
          </Badge>
        )}
        {service.pricingEngine === "marketplace" && (
          <Badge
            variant="outline"
            className="absolute right-4 top-4 z-10 border-white/15 bg-black/40 font-normal backdrop-blur-sm"
          >
            Marketplace
          </Badge>
        )}
      </div>

      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col p-6 sm:p-7",
          isFeatured && "lg:justify-center lg:p-8 lg:pl-6"
        )}
      >
        <h3
          className={cn(
            "font-heading font-semibold tracking-tight text-foreground",
            isFeatured ? "text-2xl sm:text-3xl" : "text-xl"
          )}
        >
          {service.name}
        </h3>
        <p
          className={cn(
            "mt-3 leading-relaxed text-muted-foreground",
            isFeatured ? "max-w-md text-base" : "text-sm line-clamp-3"
          )}
        >
          {description}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Starting at
              </p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
                {priceFormatted !== null ? (
                  <>
                    {priceFormatted}
                    {service.priceLabel && (
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        {service.priceLabel}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-lg font-sans font-medium">
                    {service.priceLabel ?? "Contact for quote"}
                  </span>
                )}
              </p>
            </div>

            <Button
              size={isFeatured ? "lg" : "default"}
              className={cn(
                "shrink-0 bg-primary font-medium text-primary-foreground shadow-[0_0_28px_-6px_rgba(249,115,22,0.5)] transition-shadow duration-300",
                "group-hover/card:shadow-[0_0_36px_-4px_rgba(249,115,22,0.55)]"
              )}
              render={<Link href={href} />}
            >
              {isFeatured ? "Get Started" : "View Service"}
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
