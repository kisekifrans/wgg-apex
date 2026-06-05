"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import {
  resolveMarketingHref,
  scrollToMarketingHash,
} from "@/lib/navigation/resolve-href";
import { cn } from "@/lib/utils";

type MarketingNavLinkProps = {
  href: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export function MarketingNavLink({
  href,
  children,
  className,
  onClick,
}: MarketingNavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const resolved = resolveMarketingHref(href, pathname);
  const isHash = href.startsWith("#");

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.();

      if (!isHash) return;

      if (pathname === "/") {
        e.preventDefault();
        scrollToMarketingHash(href);
        window.history.pushState(null, "", href);
        return;
      }

      e.preventDefault();
      const target = resolveMarketingHref(href, pathname);
      router.push(target);
      window.setTimeout(() => scrollToMarketingHash(href), 150);
    },
    [href, isHash, onClick, pathname, router]
  );

  return (
    <Link
      href={resolved}
      prefetch={!isHash}
      className={cn(className)}
      onClick={isHash ? handleClick : onClick}
    >
      {children}
    </Link>
  );
}
