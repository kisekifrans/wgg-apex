import Image from "next/image";

import { getBadgeAssetPaths } from "@/config/brand-assets";
import { cn } from "@/lib/utils";

type BadgeCatalogThumbProps = {
  name: string;
  className?: string;
};

export function BadgeCatalogThumb({ name, className }: BadgeCatalogThumbProps) {
  const sources = getBadgeAssetPaths(name);

  if (sources.length === 0) {
    return (
      <div
        className={cn(
          "flex size-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] text-[10px] font-medium uppercase tracking-wider text-muted-foreground",
          className
        )}
        aria-hidden
      >
        Badge
      </div>
    );
  }

  const isDual = sources.length > 1;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40",
        isDual ? "flex size-14 gap-0.5 p-0.5" : "size-14",
        className
      )}
    >
      {sources.map((src, index) => (
        <div
          key={src}
          className={cn(
            "relative overflow-hidden",
            isDual ? "min-w-0 flex-1 rounded-[4px]" : "size-full"
          )}
        >
          <Image
            src={src}
            alt={isDual ? `${name} badge ${index + 1}` : name}
            width={isDual ? 28 : 56}
            height={isDual ? 56 : 56}
            className={cn(
              "object-contain",
              isDual ? "size-full p-0.5" : "size-full p-1"
            )}
          />
        </div>
      ))}
    </div>
  );
}
