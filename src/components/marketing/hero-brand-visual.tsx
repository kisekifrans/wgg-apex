import Image from "next/image";

import { brandAssets } from "@/config/brand-assets";
import { cn } from "@/lib/utils";

type HeroBrandVisualProps = {
  placement?: "why-wgg";
};

/** Brand hero artwork — featured in Why WGG (desktop). */
export function HeroBrandVisual({ placement }: HeroBrandVisualProps) {
  const isWhyWgg = placement === "why-wgg";

  return (
    <div
      className={cn(
        "pointer-events-none overflow-hidden",
        isWhyWgg
          ? "absolute inset-0 hidden rounded-2xl lg:block"
          : "absolute inset-0 hidden lg:block"
      )}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0",
          isWhyWgg
            ? "bg-gradient-to-t from-[var(--marketing-base-mid)] via-[var(--marketing-base-mid)]/55 to-[var(--marketing-base-mid)]/20"
            : "bg-gradient-to-r from-[var(--marketing-base-mid)] via-[var(--marketing-base-mid)]/85 to-transparent"
        )}
      />
      <Image
        src={brandAssets.brandHero}
        alt=""
        width={960}
        height={540}
        sizes={isWhyWgg ? "(min-width: 1024px) 340px, 0px" : "(min-width: 1024px) 50vw, 0px"}
        className={cn(
          "absolute object-contain",
          isWhyWgg
            ? "bottom-0 left-1/2 h-[88%] w-[115%] max-w-none -translate-x-1/2 opacity-95"
            : "right-0 top-1/2 h-[min(100%,28rem)] max-w-none -translate-y-1/2 object-right opacity-90"
        )}
        style={{ width: "auto", height: "auto" }}
        priority={isWhyWgg}
      />
      <div
        className={cn(
          "absolute inset-0",
          isWhyWgg
            ? "bg-gradient-to-b from-[var(--marketing-base-mid)]/90 via-transparent to-[var(--marketing-base-mid)]/30"
            : "bg-gradient-to-t from-[var(--marketing-base-mid)] via-transparent to-[var(--marketing-base-top)]/40"
        )}
      />
    </div>
  );
}
