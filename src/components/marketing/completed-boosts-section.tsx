import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { AnimatedSection } from "@/components/shared/animated-section";
import { RankIcon } from "@/components/shared/rank-icon";
import { SectionHeader } from "@/components/shared/section-header";
import { resolveCmsImageSrc } from "@/lib/cms/image-src";
import type { CompletedBoost } from "@/lib/db/completed-boosts";

type CompletedBoostsSectionProps = {
  boosts: CompletedBoost[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CompletedBoostsSection({
  boosts,
}: CompletedBoostsSectionProps) {
  if (boosts.length === 0) return null;

  return (
    <AnimatedSection
      id="completed-boosts"
      className="border-t border-white/[0.06] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Proof of work"
          title="Recent completed boosts"
          description="Verified rank climbs delivered by WGG operators — screenshots, spans, and completion dates from real orders."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {boosts.map((boost) => (
            <article
              key={boost.id}
              className="group overflow-hidden rounded-2xl border border-white/5 bg-card/40"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
                <Image
                  src={resolveCmsImageSrc(boost.screenshotPath)}
                  alt={`${boost.fromRank} to ${boost.toRank} boost`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-sm font-medium">
                  <RankIcon tier={boost.fromRank} size="sm" />
                  <span>{boost.fromRank}</span>
                  <ArrowRight className="size-4 text-primary" />
                  <RankIcon tier={boost.toRank} size="sm" />
                  <span>{boost.toRank}</span>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  {boost.serviceType}
                </p>
                {boost.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {boost.description}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">
                  Completed {formatDate(boost.completedAt)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
