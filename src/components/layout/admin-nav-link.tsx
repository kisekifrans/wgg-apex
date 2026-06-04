"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isAdminNavActive, type AdminNavItem } from "@/config/admin-nav";
import { cn } from "@/lib/utils";

type AdminNavLinkProps = {
  item: AdminNavItem;
  onNavigate?: () => void;
  collapsed?: boolean;
};

export function AdminNavLink({
  item,
  onNavigate,
  collapsed = false,
}: AdminNavLinkProps) {
  const pathname = usePathname();
  const active = isAdminNavActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
      title={collapsed ? item.title : undefined}
    >
      <Icon
        className={cn(
          "size-[18px] shrink-0",
          active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
        aria-hidden
      />
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );
}
