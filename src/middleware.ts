import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { isRequestAdmin } from "@/lib/auth/middleware-admin";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function middleware(request: NextRequest) {
  const { url, anonKey, isConfigured } = getSupabaseEnv();
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  if (!isConfigured || !url || !anonKey) {
    if (pathname.startsWith("/admin")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "supabase_not_configured");
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAccountRoute =
    pathname === "/account" || pathname.startsWith("/account/");
  const isAccountLogin = pathname === "/account/login";

  if (isAccountRoute && !isAccountLogin) {
    if (!user) {
      const loginUrl = new URL("/account/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isAccountLogin && user) {
    const redirectTo = safeRedirectPath(
      request.nextUrl.searchParams.get("redirectTo"),
      "/account"
    );
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isAdmin = await isRequestAdmin(supabase, user.id, user.email ?? "");
    if (!isAdmin) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "not_admin");
      loginUrl.searchParams.set("redirectTo", "/admin");
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname === "/login" && user) {
    const isAdmin = await isRequestAdmin(supabase, user.id, user.email ?? "");
    if (isAdmin) {
      const redirectTo = safeRedirectPath(
        request.nextUrl.searchParams.get("redirectTo"),
        "/admin"
      );
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/account", "/account/:path*"],
};
