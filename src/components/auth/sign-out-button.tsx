"use client";

import { LogOut } from "lucide-react";

import { signOut } from "@/actions/auth/sign-out";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutMenuItem() {
  return (
    <DropdownMenuItem
      variant="destructive"
      onClick={() => {
        void signOut();
      }}
    >
      <LogOut className="size-4" />
      Sign out
    </DropdownMenuItem>
  );
}
