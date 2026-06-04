import Link from "next/link";
import { ArrowRight, FileSearch, Scale, ShieldAlert } from "lucide-react";

import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { unbanFeatures } from "@/config/platform";

export function UnbanServiceSection() {
  return (
    <AnimatedSection
      id="unban"
      className="border-t border-white/5 bg-[#0F0F12]/40 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeader
              eyebrow="Recovery"
              title="Apex unban service"
              description="Structured case support for suspended accounts. We screen eligibility first, document every step, and set realistic expectations—no false guarantees."
            />

            <ul className="mt-8 space-y-4">
              {unbanFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                render={<Link href="/order/apex-unban" />}
              >
                Start eligibility review
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/10"
                render={<Link href="/legal/refund-policy" />}
              >
                Refund policy
              </Button>
            </div>

            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Outcomes depend on publisher enforcement policies. WGG provides
              operational guidance—not legal representation.
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <ProcessCard
                icon={FileSearch}
                title="Screen"
                description="Account and ban context reviewed before you pay."
              />
              <ProcessCard
                icon={Scale}
                title="Document"
                description="Timeline logged in your dashboard with operator notes."
              />
              <ProcessCard
                icon={ShieldAlert}
                title="Advise"
                description="Clear next steps—or ineligible refund per policy."
              />
            </div>
            <div className="mt-6 rounded-lg border border-white/5 bg-background/50 px-4 py-3">
              <p className="text-xs text-muted-foreground">Starting at</p>
              <p className="font-mono text-2xl font-semibold tabular-nums">
                $149
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

function ProcessCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileSearch;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <Icon className="size-5 text-primary" aria-hidden />
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
