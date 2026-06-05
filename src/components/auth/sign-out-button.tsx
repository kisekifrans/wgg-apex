"use client";

import type { ComponentProps } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type SignOutButtonProps = ComponentProps<typeof Button> & {
  redirectTo?: string;
};

function signOutHref(redirectTo: string): string {
  return `/api/auth/sign-out?redirectTo=${encodeURIComponent(redirectTo)}`;
}

/** Full document navigation — required so the API redirect + cookie clearing works. */
function navigateToSignOut(redirectTo: string) {
  window.location.assign(signOutHref(redirectTo));
}

export function SignOutButton({
  redirectTo = "/login",
  children,
  ...props
}: SignOutButtonProps) {
  return (
    <Button
      type="button"
      {...props}
      onClick={() => navigateToSignOut(redirectTo)}
    >
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
    <DropdownMenuItem
      variant="destructive"
      onClick={() => navigateToSignOut(redirectTo)}
    >
      <LogOut className="size-4" />
      Sign out
    </DropdownMenuItem>
  );
}
