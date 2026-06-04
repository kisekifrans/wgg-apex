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
  const redirectTo = safeRedirectPath(
    searchParams.get("redirectTo"),
    "/admin"
  );

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
      if (isAdminEmail(data.user.email)) {
        await ensureAdminProfileRole(data.user.id, data.user.email);
      }
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
