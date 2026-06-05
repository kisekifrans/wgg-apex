"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

import { signInCustomerAction } from "@/actions/auth/sign-in-customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerLoginForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signInCustomerAction({
      email: String(formData.get("email") ?? ""),
    });

    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setSent(true);
    toast.success(result.message);
  }

  if (sent) {
    return (
      <div className="space-y-4 rounded-2xl border border-white/5 bg-card/40 p-6 sm:p-8">
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a sign-in link to your inbox. Open it on this device to view
          your orders. Links expire after a short time — you can request another
          below.
        </p>
        <Button
          type="button"
          variant="outline"
          className="border-white/10"
          onClick={() => setSent(false)}
        >
          Send another link
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-white/5 bg-card/40 p-6 sm:p-8"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Checkout email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="border-white/10 bg-background/50"
        />
        <p className="text-xs text-muted-foreground">
          Use the same email from your order confirmation. We send a one-time
          magic link — no password.
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
        ) : (
          <Mail className="size-4" data-icon="inline-start" />
        )}
        Email Me a Sign-In Link
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Prefer a one-off lookup?{" "}
        <Link href="/track-order" className="text-primary hover:underline">
          Track a single order
        </Link>
      </p>
    </form>
  );
}
