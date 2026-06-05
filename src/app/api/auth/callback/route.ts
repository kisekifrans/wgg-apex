import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { ensureAdminProfileRole } from "@/lib/auth/ensure-admin-profile";
import { isAdminEmail } from "@/lib/auth/roles";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { getSupabaseEnv } from "@/lib/supabase/env";

type CookieToSet = {
  name: string;
  value: string;
  options: Parameters<NextResponse["cookies"]["set"]>[2];
};

function authErrorRedirect(origin: string) {
  const url = new URL("/account/login", origin);
  url.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(url);
}

function redirectWithCookies(
  origin: string,
  destination: string,
  cookiesToSet: CookieToSet[]
) {
  const response = NextResponse.redirect(new URL(destination, origin));
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type");
  const authError =
    searchParams.get("error_description") ?? searchParams.get("error");

  const rawRedirect = searchParams.get("redirectTo");
  const redirectTo = safeRedirectPath(rawRedirect, "/account");

  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured || !url || !anonKey) {
    const errUrl = new URL("/account/login", origin);
    errUrl.searchParams.set("error", "supabase_not_configured");
    return NextResponse.redirect(errUrl);
  }

  if (authError) {
    return authErrorRedirect(origin);
  }

  const cookieStore = await cookies();
  const pendingCookies: CookieToSet[] = [];

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        pendingCookies.length = 0;
        cookiesToSet.forEach((cookie) => {
          pendingCookies.push(cookie);
        });
      },
    },
  });

  let userEmail: string | null = null;
  let userId: string | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user?.email) {
      console.error("[auth callback] exchangeCodeForSession:", error?.message);
      return authErrorRedirect(origin);
    }
    userEmail = data.user.email;
    userId = data.user.id;
  } else if (tokenHash && otpType) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType as EmailOtpType,
    });
    if (error || !data.user?.email) {
      console.error("[auth callback] verifyOtp:", error?.message);
      return authErrorRedirect(origin);
    }
    userEmail = data.user.email;
    userId = data.user.id;
  } else {
    console.error("[auth callback] missing code and token_hash");
    return authErrorRedirect(origin);
  }

  if (isAdminEmail(userEmail)) {
    await ensureAdminProfileRole(userId!, userEmail);
  }

  const destination =
    isAdminEmail(userEmail) && (!rawRedirect || rawRedirect === "/account")
      ? "/admin"
      : redirectTo;

  return redirectWithCookies(origin, destination, pendingCookies);
}
