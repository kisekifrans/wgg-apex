import Image from "next/image";

import { cn } from "@/lib/utils";
import type { MarketplaceListing } from "@/types/marketplace";

type ListingCardImageProps = {
  listing: MarketplaceListing;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function ListingCardImage({
  listing,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 320px",
}: ListingCardImageProps) {
  const image = listing.images[0];
  const isSold = listing.status === "sold";

  return (
    <div
      className={cn(
        "relative aspect-[16/10] overflow-hidden rounded-lg bg-white/5",
        className
      )}
    >
      {image ? (
        <Image
          src={image.publicUrl}
          alt={image.altText ?? listing.title}
          fill
          className={cn(
            "object-cover transition-all",
            isSold && "opacity-60 grayscale-[30%]"
          )}
          sizes={sizes}
          priority={priority}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          No image
        </div>
      )}

      {isSold && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="rounded-md border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
            Sold
          </span>
        </div>
      )}

      {listing.status === "reserved" && !isSold && (
        <div className="absolute left-2 top-2">
          <span className="rounded-md border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100">
            Reserved
          </span>
        </div>
      )}
    </div>
  );
}
