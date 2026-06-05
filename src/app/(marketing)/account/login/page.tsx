import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CustomerLoginForm } from "@/components/account/customer-login-form";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sign In — My Orders",
  description:
    "Sign in or create your WGG Apex account with your checkout email. No password needed.",
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
          Sign in or create account
        </h1>
        <p className="mt-3 text-muted-foreground">
          Use the email from checkout. First time here? We create your account
          automatically when you open the magic link — no password required.
        </p>
      </header>

      <CustomerLoginForm />
    </div>
  );
}
