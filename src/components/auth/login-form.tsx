"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/actions/auth/sign-in";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

const errorMessages: Record<string, string> = {
  supabase_not_configured:
    "Supabase is not configured. Add environment variables to enable admin login.",
  not_admin: "Your account does not have admin access.",
  auth_callback_failed: "Authentication failed. Please try again.",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(
    searchParams.get("redirectTo"),
    "/admin"
  );
  const errorKey = searchParams.get("error");
  const errorMessage = errorKey ? errorMessages[errorKey] : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { isConfigured } = getSupabaseEnv();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!isConfigured) {
      setFormError(errorMessages.supabase_not_configured);
      return;
    }

    setLoading(true);

    try {
      const result = await signInAction(email, password);

      if (!result.success) {
        setFormError(result.error);
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setFormError("Unable to sign in. Check your configuration.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div className="mb-8 flex justify-center">
        <Logo variant="auth" className="justify-center" />
      </div>

      <div className="glass-panel rounded-2xl p-6 sm:p-8">
        <h1 className="font-heading text-center text-2xl font-semibold tracking-tight">
          Admin sign in
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Access the WGG Apex operations dashboard.
        </p>

        {(errorMessage || formError) && (
          <div
            className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {formError ?? errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@wggapex.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!isConfigured || loading}
              className="border-white/10 bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={!isConfigured || loading}
              className="border-white/10 bg-background/50"
            />
          </div>
          <Button
            type="submit"
            className={cn(
              "h-10 w-full bg-primary font-medium text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
            )}
            disabled={!isConfigured || loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
