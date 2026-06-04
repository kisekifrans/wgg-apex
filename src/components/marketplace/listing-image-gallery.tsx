"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MarketplaceListing } from "@/types/marketplace";

export function ListingImageGallery({ listing }: { listing: MarketplaceListing }) {
  const images = listing.images;
  const [activeIndex, setActiveIndex] = useState(0);
  const isSold = listing.status === "sold";

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-white/5 bg-card/40 text-sm text-muted-foreground">
        No images available
      </div>
    );
  }

  const active = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative aspect-[16/10] overflow-hidden rounded-xl border border-white/5 bg-white/5",
          isSold && "ring-1 ring-white/10"
        )}
      >
        <Image
          src={active.publicUrl}
          alt={active.altText ?? listing.title}
          fill
          className={cn("object-cover", isSold && "opacity-70 grayscale-[20%]")}
          sizes="(max-width: 1024px) 100vw, 720px"
          priority
        />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="rounded-lg border border-white/20 bg-black/70 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-white">
              Sold
            </span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-video overflow-hidden rounded-lg border transition-all",
                index === activeIndex
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-white/10 opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={image.publicUrl}
                alt=""
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
