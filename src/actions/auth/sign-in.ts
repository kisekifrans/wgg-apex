"use server";

import { headers } from "next/headers";

import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";

export type SignInResult =
  | { success: true }
  | { success: false; error: string };

export async function signInAction(
  email: string,
  password: string
): Promise<SignInResult> {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const limit = checkRateLimit(`login:${ip}`, {
    limit: 10,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return {
      success: false,
      error: `Too many sign-in attempts. Try again in ${limit.retryAfterSec} seconds.`,
    };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      success: false,
      error:
        "Supabase is not configured. Add environment variables to enable admin login.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
