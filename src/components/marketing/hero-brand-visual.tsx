import Image from "next/image";

import { brandAssets } from "@/config/brand-assets";

/** Wide brand banner behind hero order preview (desktop). */
export function HeroBrandVisual() {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--marketing-base-mid)] via-[var(--marketing-base-mid)]/85 to-transparent" />
      <Image
        src={brandAssets.brandHero}
        alt=""
        width={960}
        height={540}
        sizes="(min-width: 1024px) 50vw, 0px"
        className="absolute right-0 top-1/2 h-[min(100%,28rem)] max-w-none -translate-y-1/2 object-contain object-right opacity-90"
        style={{ width: "auto", height: "auto" }}
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--marketing-base-mid)] via-transparent to-[var(--marketing-base-top)]/40" />
    </div>
  );
}
