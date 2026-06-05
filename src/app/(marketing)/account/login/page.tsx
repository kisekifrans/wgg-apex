import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CustomerLoginForm } from "@/components/account/customer-login-form";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "My Orders — Sign In",
  description: "Sign in with your checkout email to view all WGG Apex orders.",
};

export default function AccountLoginPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-12 pb-24 pt-28 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-8 text-muted-foreground"
        render={<Link href="/" />}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to home
      </Button>

      <header className="mb-10">
        <p className="text-sm font-medium tracking-wide text-[var(--brand-gold)]">
          Customer account
        </p>
        <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          My Orders
        </h1>
        <p className="mt-3 text-muted-foreground">
          Sign in with the email you used at checkout. We will email you a
          secure link — no password needed.
        </p>
      </header>

      <CustomerLoginForm />
    </div>
  );
}
