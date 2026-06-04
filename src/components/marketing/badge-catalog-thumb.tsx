import Image from "next/image";

import { getBadgeAssetPath } from "@/config/brand-assets";
import { cn } from "@/lib/utils";

type BadgeCatalogThumbProps = {
  name: string;
  className?: string;
};

export function BadgeCatalogThumb({ name, className }: BadgeCatalogThumbProps) {
  const src = getBadgeAssetPath(name);

  if (!src) {
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

  return (
    <div
      className={cn(
        "relative size-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black/40",
        className
      )}
    >
      <Image
        src={src}
        alt={name}
        width={56}
        height={56}
        className="size-full object-contain p-1"
      />
    </div>
  );
}
