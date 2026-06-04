import {
  AnimatedItem,
  AnimatedSection,
  AnimatedStagger,
} from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import { customerProcessSteps } from "@/config/platform";

export function CustomerProcessSection() {
  return (
    <AnimatedSection
      id="process"
      className="border-t border-white/[0.06] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Process"
          title="How It Works"
          description="The same flow for every service—from ranked orders to marketplace buys."
          align="center"
          className="mx-auto"
        />

        <AnimatedStagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {customerProcessSteps.map((step, index) => (
            <AnimatedItem key={step.step}>
              <article className="relative h-full rounded-xl border border-white/5 bg-card/40 p-6">
                {index < customerProcessSteps.length - 1 && (
                  <div
                    className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-white/10 lg:block"
                    aria-hidden
                  />
                )}
                <span className="font-mono text-xs font-medium text-[var(--brand-gold)]">
                  {step.step}
                </span>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </article>
            </AnimatedItem>
          ))}
        </AnimatedStagger>
      </div>
    </AnimatedSection>
  );
}
