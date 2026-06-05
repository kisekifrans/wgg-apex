"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getSiteUrl } from "@/lib/stripe/env";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export type CustomerSignInResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function signInCustomerAction(
  input: z.infer<typeof emailSchema>
): Promise<CustomerSignInResult> {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const limit = checkRateLimit(`customer-login:${ip}`, {
    limit: 8,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return {
      success: false,
      error: `Too many sign-in attempts. Try again in ${limit.retryAfterSec} seconds.`,
    };
  }

  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid email",
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      success: false,
      error: "Sign-in is not configured. Contact support.",
    };
  }

  const siteUrl = getSiteUrl();
  const redirectTo = encodeURIComponent("/account");

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${siteUrl}/api/auth/callback?redirectTo=${redirectTo}`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message:
      "Check your inbox for a sign-in link. Use the same email you used at checkout.",
  };
}
