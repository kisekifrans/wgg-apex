"use client";

import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";

import { SignOutMenuItem } from "@/components/auth/sign-out-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import type { AdminUser } from "@/types/auth";

type AdminTopBarProps = {
  user: AdminUser;
  title?: string;
  description?: string;
};

function getInitials(user: AdminUser) {
  if (user.fullName) {
    return user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

export function AdminTopBar({ user, title, description }: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-white/5 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-[280px] border-white/5 bg-[#0c0c0c] p-0">
          <AdminSidebar mobile />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        {title && (
          <h1 className="truncate font-heading text-base font-semibold tracking-tight sm:text-lg">
            {title}
          </h1>
        )}
        {description && (
          <p className="hidden truncate text-sm text-muted-foreground sm:block">
            {description}
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="hidden text-muted-foreground sm:inline-flex"
        render={
          <Link href="/" target="_blank" rel="noopener noreferrer" />
        }
      >
        <ExternalLink className="size-4" data-icon="inline-start" />
        View site
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          aria-label="Account menu"
          className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Avatar className="size-9 border border-white/10">
            <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-primary/15 text-xs text-primary">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <p className="truncate text-sm font-medium">{user.fullName ?? "Admin"}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs capitalize text-primary">
              {user.role.replace("_", " ")}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuLinkItem
            render={<Link href="/admin/settings" />}
            closeOnClick
          >
            Settings
          </DropdownMenuLinkItem>
          <DropdownMenuSeparator />
          <SignOutMenuItem />
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
