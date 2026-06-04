"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeft } from "lucide-react";
import { useState } from "react";

import { AdminNavLink } from "@/components/layout/admin-nav-link";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { adminNavItems } from "@/config/admin-nav";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  className?: string;
  onNavigate?: () => void;
  mobile?: boolean;
};

export function AdminSidebar({
  className,
  onNavigate,
  mobile = false,
}: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-white/5 bg-[#0c0c0c]",
        !mobile && (collapsed ? "w-[72px]" : "w-60"),
        mobile && "w-full",
        className
      )}
    >
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-white/5 px-4",
          collapsed && !mobile && "justify-center px-2"
        )}
      >
        {collapsed && !mobile ? (
          <Logo variant="icon" href="/admin" />
        ) : (
          <Logo variant="nav" href="/admin" />
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1" aria-label="Admin">
          {adminNavItems.map((item) => (
            <AdminNavLink
              key={item.href}
              item={item}
              onNavigate={onNavigate}
              collapsed={collapsed && !mobile}
            />
          ))}
        </nav>
      </ScrollArea>

      {!mobile && (
        <>
          <Separator className="bg-white/5" />
          <div className={cn("p-3", collapsed && "flex justify-center")}>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeft className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>
          </div>
        </>
      )}
    </aside>
  );
}
