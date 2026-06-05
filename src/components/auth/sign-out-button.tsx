"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenuLinkItem } from "@/components/ui/dropdown-menu";

type SignOutButtonProps = ComponentProps<typeof Button> & {
  redirectTo?: string;
};

function signOutHref(redirectTo: string): string {
  return `/api/auth/sign-out?redirectTo=${encodeURIComponent(redirectTo)}`;
}

export function SignOutButton({
  redirectTo = "/login",
  children,
  ...props
}: SignOutButtonProps) {
  return (
    <Button {...props} render={<Link href={signOutHref(redirectTo)} />}>
      {children}
    </Button>
  );
}

export function SignOutMenuItem({
  redirectTo = "/login",
}: {
  redirectTo?: string;
}) {
  return (
    <DropdownMenuLinkItem
      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
      render={<Link href={signOutHref(redirectTo)} />}
      closeOnClick
    >
      <LogOut className="size-4" />
      Sign out
    </DropdownMenuLinkItem>
  );
}
