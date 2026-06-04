import Link from "next/link";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-[#991b1b]/40 to-[#0a0a0a] font-heading text-xs font-bold tracking-tight text-gradient-gold shadow-[0_0_20px_-6px_rgba(249,115,22,0.5)] transition-shadow group-hover:shadow-[0_0_24px_-4px_rgba(249,115,22,0.55)]">
        WGG
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-sm font-semibold tracking-tight text-foreground">
          {siteConfig.name}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Apex
        </span>
      </span>
    </Link>
  );
}
