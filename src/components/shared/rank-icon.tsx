import Image from "next/image";

import {
  getRankAssetPath,
  parseRankTierFromLabel,
} from "@/config/brand-assets";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
} as const;

const sizePixels = {
  sm: 24,
  md: 32,
  lg: 40,
} as const;

type RankIconProps = {
  /** Catalog tier name (e.g. "Gold") or rank label (e.g. "Gold II"). */
  tier: string;
  size?: keyof typeof sizeClasses;
  className?: string;
};

export function RankIcon({ tier, size = "md", className }: RankIconProps) {
  const parsed = parseRankTierFromLabel(tier) ?? tier;
  const src = getRankAssetPath(parsed);

  if (!src) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md border border-dashed border-white/10 bg-white/[0.02] text-[9px] font-medium uppercase text-muted-foreground",
          sizeClasses[size],
          className
        )}
        aria-hidden
      />
    );
  }

  const px = sizePixels[size];

  return (
    <span
      className={cn(
        "relative inline-block shrink-0 overflow-hidden rounded-md",
        sizeClasses[size],
        className
      )}
    >
      <Image
        src={src}
        alt={`${parsed} rank`}
        fill
        sizes={`${px}px`}
        className="object-contain"
      />
    </span>
  );
}
