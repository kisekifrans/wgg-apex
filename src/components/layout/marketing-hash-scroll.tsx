"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { scrollToMarketingHash } from "@/lib/navigation/resolve-href";

/** Scroll to #section after navigating to the homepage from another route. */
export function MarketingHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/" || !window.location.hash) return;

    const hash = window.location.hash;
    const timer = window.setTimeout(() => scrollToMarketingHash(hash), 50);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}
