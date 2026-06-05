import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ensureAdminProfileRole } from "@/lib/auth/ensure-admin-profile";
import { isAdminEmail } from "@/lib/auth/roles";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawRedirect = searchParams.get("redirectTo");
  const defaultRedirect = "/account";
  const redirectTo = safeRedirectPath(rawRedirect, defaultRedirect);

  const { url, anonKey, isConfigured } = getSupabaseEnv();

  if (!isConfigured || !url || !anonKey) {
    return NextResponse.redirect(
      `${origin}/login?error=supabase_not_configured`
    );
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      const email = data.user.email;
      if (isAdminEmail(email)) {
        await ensureAdminProfileRole(data.user.id, email);
      }

      const destination =
        isAdminEmail(email) && (!rawRedirect || rawRedirect === "/account")
          ? "/admin"
          : redirectTo;

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
