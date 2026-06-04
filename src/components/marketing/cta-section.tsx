"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { brandAssets } from "@/config/brand-assets";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  const prefersReducedMotion = useReducedMotion();

  const inner = (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card via-card to-[#991b1b]/10 px-6 py-14 text-center sm:px-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-brand-glow-bottom opacity-80"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 top-0 hidden h-full w-[min(55%,22rem)] sm:block"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/90 to-transparent" />
        <Image
          src={brandAssets.brandHero}
          alt=""
          width={480}
          height={270}
          sizes="(min-width: 640px) 22rem, 0px"
          className="absolute right-0 top-1/2 max-h-full -translate-y-1/2 object-contain object-right opacity-35"
          style={{ width: "auto", height: "auto" }}
        />
      </div>
      <div className="relative">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to compete at your target level?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Choose a service, get a verified quote, and track every milestone in
          one platform—built for players who take ranked seriously.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-11 min-w-[220px] bg-primary font-medium text-primary-foreground shadow-[0_0_32px_-8px] shadow-[rgba(249,115,22,0.4)] hover:bg-[var(--brand-orange-deep)]"
            render={<Link href="#services" />}
          >
            Explore services
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 min-w-[220px] border-white/10"
            render={<Link href="/login" />}
          >
            Sign in to dashboard
          </Button>
        </div>
      </div>
    </div>
  );

  if (prefersReducedMotion) {
    return (
      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{inner}</div>
      </section>
    );
  }

  return (
    <section className="pb-20 sm:pb-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
        >
          {inner}
        </motion.div>
      </div>
    </section>
  );
}
