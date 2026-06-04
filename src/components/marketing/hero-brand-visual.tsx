import Image from "next/image";

import { brandAssets } from "@/config/brand-assets";

/** Wide brand banner behind hero order preview (desktop). */
export function HeroBrandVisual() {
  return (
    <div
      className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent" />
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/40" />
    </div>
  );
}
