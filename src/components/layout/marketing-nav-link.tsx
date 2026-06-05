"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { resolveMarketingHref } from "@/lib/navigation/resolve-href";
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
  const resolved = resolveMarketingHref(href, pathname);

  return (
    <Link href={resolved} className={cn(className)} onClick={onClick}>
      {children}
    </Link>
  );
}
