"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CtaSection() {
  const prefersReducedMotion = useReducedMotion();

  const inner = (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-card/90 via-card/80 to-[#991b1b]/15 px-6 py-14 text-center shadow-[0_0_80px_-24px_rgba(249,115,22,0.25)] backdrop-blur-sm sm:px-12 sm:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-hero-spotlight opacity-60"
        aria-hidden
      />
      <div className="relative">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to Hit Your Target Rank?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Pick a service, lock in your price, and track every milestone—built
          for players who take ranked seriously.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-11 min-w-[220px] bg-primary font-medium text-primary-foreground shadow-[0_0_32px_-8px] shadow-[rgba(249,115,22,0.4)] hover:bg-[var(--brand-orange-deep)]"
            render={<Link href="#services" />}
          >
            Explore Services
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 min-w-[220px] border-white/10"
            render={<Link href="/login" />}
          >
            Sign In to Dashboard
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
