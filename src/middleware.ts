import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

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

  if (pathname.startsWith("/admin") && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && user) {
    const redirectTo =
      request.nextUrl.searchParams.get("redirectTo") ?? "/admin";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
