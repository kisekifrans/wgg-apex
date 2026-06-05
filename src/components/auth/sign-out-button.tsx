"use client";

import type { ComponentProps } from "react";
import { LogOut } from "lucide-react";

import { signOut } from "@/actions/auth/sign-out";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type SignOutButtonProps = ComponentProps<typeof Button> & {
  redirectTo?: string;
};

export function SignOutButton({
  redirectTo = "/login",
  children,
  ...props
}: SignOutButtonProps) {
  return (
    <Button
      type="button"
      {...props}
      onClick={() => {
        void signOut(redirectTo);
      }}
    >
      {children}
    </Button>
  );
}

export function SignOutMenuItem() {
  return (
    <DropdownMenuItem
      variant="destructive"
      onClick={() => {
        void signOut("/login");
      }}
    >
      <LogOut className="size-4" />
      Sign out
    </DropdownMenuItem>
  );
}
