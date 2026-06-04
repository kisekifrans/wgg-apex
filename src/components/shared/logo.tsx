import Image from "next/image";
import Link from "next/link";

import { brandAssets } from "@/config/brand-assets";
import { cn } from "@/lib/utils";

export type LogoVariant = "nav" | "footer" | "auth" | "icon";

type LogoProps = {
  className?: string;
  href?: string;
  /** nav: header; footer: marketing footer; auth: login; icon: collapsed admin */
  variant?: LogoVariant;
};

const variantConfig: Record<
  LogoVariant,
  { width: number; height: number; sizes: string; imageClass: string }
> = {
  nav: {
    width: 140,
    height: 40,
    sizes: "(max-width: 640px) 108px, 140px",
    imageClass: "h-9 w-auto max-w-[108px] sm:h-10 sm:max-w-[140px]",
  },
  footer: {
    width: 200,
    height: 72,
    sizes: "200px",
    imageClass: "h-14 w-auto max-w-[180px] sm:h-16 sm:max-w-[200px]",
  },
  auth: {
    width: 220,
    height: 80,
    sizes: "220px",
    imageClass: "h-16 w-auto max-w-[200px] sm:h-[4.5rem] sm:max-w-[220px]",
  },
  icon: {
    width: 72,
    height: 32,
    sizes: "72px",
    imageClass: "h-8 w-auto max-w-[72px]",
  },
};

export function Logo({ className, href = "/", variant = "nav" }: LogoProps) {
  const config = variantConfig[variant];
  const priority = variant === "nav" || variant === "auth";

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 transition-opacity hover:opacity-90",
        variant === "auth" && "flex-col gap-3",
        className
      )}
    >
      <Image
        src={brandAssets.logo}
        alt="We Are God Gamers — WGG"
        width={config.width}
        height={config.height}
        sizes={config.sizes}
        className={cn(
          "h-auto w-auto max-h-full object-contain object-left",
          config.imageClass,
          "drop-shadow-[0_0_12px_rgba(249,115,22,0.15)] transition-[filter] group-hover:drop-shadow-[0_0_16px_rgba(249,115,22,0.25)]"
        )}
        style={{ width: "auto", height: "auto" }}
        priority={priority}
      />
      {variant === "nav" && (
        <span className="hidden border-l border-white/10 pl-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:inline">
          Apex
        </span>
      )}
    </Link>
  );
}
