"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Star } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { DISCORD_REVIEWS_CHANNEL_URL } from "@/config/discord-community";
import { resolveCmsImageSrc } from "@/lib/cms/image-src";
import type { CustomerReview } from "@/lib/db/customer-reviews";
import { cn } from "@/lib/utils";

type ReviewsSectionProps = {
  reviews: CustomerReview[];
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < rating
              ? "fill-[var(--brand-gold)] text-[var(--brand-gold)]"
              : "text-white/15"
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: CustomerReview }) {
  return (
    <article className="group relative flex h-full w-[min(88vw,20rem)] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-card/40 p-6 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-1 hover:border-primary/30 hover:bg-card/55 hover:shadow-[0_20px_40px_-20px_rgba(249,115,22,0.35)] sm:w-80">
      <div
        className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />

      <StarRating rating={review.rating} />

      <p className="mt-4 line-clamp-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{review.reviewText}&rdquo;
      </p>

      <div className="mt-6 flex items-center gap-3 border-t border-white/5 pt-4">
        <div className="relative size-10 overflow-hidden rounded-full border border-white/10 bg-white/5 transition-transform duration-300 group-hover:scale-105">
          {review.avatarPath ? (
            <Image
              src={resolveCmsImageSrc(review.avatarPath)}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-xs font-semibold text-primary">
              {review.customerName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{review.customerName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {review.serviceType}
          </p>
        </div>
      </div>
    </article>
  );
}

type ReviewMarqueeRowProps = {
  reviews: CustomerReview[];
  direction: "left" | "right";
  durationSec: number;
};

function ReviewMarqueeRow({
  reviews,
  direction,
  durationSec,
}: ReviewMarqueeRowProps) {
  if (reviews.length === 0) return null;

  const loop = [...reviews, ...reviews];

  return (
    <div className="review-marquee-track overflow-hidden">
      <div
        className={cn(
          "flex w-max gap-5 py-1",
          direction === "left" ? "review-marquee-left" : "review-marquee-right"
        )}
        style={
          {
            "--review-marquee-duration": `${durationSec}s`,
          } as React.CSSProperties
        }
      >
        {loop.map((review, index) => (
          <ReviewCard key={`${review.id}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (reviews.length === 0) return null;

  return (
    <AnimatedSection
      id="reviews"
      className="border-t border-white/[0.06] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <SectionHeader
          align="center"
          eyebrow="Social proof"
          title="What players say"
          description="Real feedback from customers who trusted WGG operators with their rank, Predator RP, and account goals."
          className="mx-auto"
        />

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            className="h-11 bg-[#5865F2] font-medium text-white hover:bg-[#4752C4]"
            nativeButton={false}
            render={
              <Link
                href={DISCORD_REVIEWS_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <MessageCircle className="size-4" data-icon="inline-start" />
            Check all the reviews on Discord
          </Button>
        </div>
      </div>

      <div className="relative mt-12 w-full">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background via-background/80 to-transparent sm:w-28"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background via-background/80 to-transparent sm:w-28"
          aria-hidden
        />

        {prefersReducedMotion ? (
          <div className="scrollbar-wgg mx-auto flex max-w-6xl justify-center gap-5 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <ReviewMarqueeRow
              reviews={reviews}
              direction="left"
              durationSec={50}
            />
          </motion.div>
        )}
      </div>
    </AnimatedSection>
  );
}
