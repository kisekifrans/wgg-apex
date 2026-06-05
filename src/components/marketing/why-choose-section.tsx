import {
  Activity,
  Headphones,
  Layers,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { HeroBrandVisual } from "@/components/marketing/hero-brand-visual";
import {
  AnimatedItem,
  AnimatedSection,
  AnimatedStagger,
} from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import { whyWggItems } from "@/config/platform";

const icons: LucideIcon[] = [
  ShieldCheck,
  Activity,
  Sparkles,
  Headphones,
  Layers,
];

export function WhyChooseSection() {
  return (
    <AnimatedSection
      id="why-wgg"
      className="border-t border-white/[0.06] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
          <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-white/5 bg-card/30 lg:min-h-[420px]">
            <HeroBrandVisual placement="why-wgg" />
            <div className="relative z-10 p-6 sm:p-8">
              <SectionHeader
                eyebrow="Why WGG"
                title="Why Competitive Players Choose WGG"
                description="The most reliable ranked service in Apex—not a discount boost shop. Straight pricing, legit operators, and delivery you can track."
              />
            </div>
          </div>

          <AnimatedStagger className="grid gap-4 sm:grid-cols-2">
            {whyWggItems.map((item, index) => {
              const Icon = icons[index] ?? Activity;
              return (
                <AnimatedItem key={item.title}>
                  <article className="h-full rounded-xl border border-white/5 bg-card/40 p-6 transition-colors hover:border-white/10 hover:bg-card/60">
                    <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </article>
                </AnimatedItem>
              );
            })}
          </AnimatedStagger>
        </div>
      </div>
    </AnimatedSection>
  );
}
