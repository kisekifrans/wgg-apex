"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Shield,
} from "lucide-react";

import { HeroOrderPreview } from "@/components/marketing/hero-order-preview";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const trustSignals = [
  { icon: Shield, label: "Operator-verified orders" },
  { icon: Lock, label: "Stripe secure checkout" },
  { icon: CheckCircle2, label: "Live order tracking" },
];

export function HeroSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28 lg:pb-32">
      <div
        className="pointer-events-none absolute inset-0 bg-brand-glow"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-brand-glow-bottom opacity-60"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-35"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <motion.div
          className="max-w-xl"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        >
          <p className="text-sm font-medium tracking-wide text-[var(--brand-gold)]">
            {siteConfig.tagline}
          </p>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            The Apex services platform for serious players.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Ranked boosting, Predator maintenance, badges, unban support, and
            verified accounts—one premium workflow built for competitive
            standards.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="h-11 bg-primary px-6 font-medium text-primary-foreground shadow-[0_0_32px_-8px] shadow-[rgba(249,115,22,0.45)] hover:bg-[var(--brand-orange-deep)]"
              render={<Link href="#services" />}
            >
              Explore services
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 border-white/10 bg-white/5 hover:bg-white/10"
              render={<Link href="#process" />}
            >
              How it works
            </Button>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {trustSignals.map((signal) => (
              <li
                key={signal.label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <signal.icon
                  className="size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span>{signal.label}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="relative lg:pl-4">
          <HeroOrderPreview />
        </div>
      </div>
    </section>
  );
}
