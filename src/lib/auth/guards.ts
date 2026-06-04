import "server-only";

import { redirect } from "next/navigation";

import { ensureAdminProfileRole } from "@/lib/auth/ensure-admin-profile";
import { safeRedirectPath } from "@/lib/auth/safe-redirect";
import { getAdminUser, getSessionUser } from "@/lib/auth/session";
import { getSupabaseEnv } from "@/lib/supabase/env";
import type { AdminUser } from "@/types/auth";

export async function requireAuth(redirectTo?: string) {
  const user = await getSessionUser();

  if (!user) {
    const params = new URLSearchParams();
    if (redirectTo) {
      params.set("redirectTo", safeRedirectPath(redirectTo, "/admin"));
    }
    const query = params.toString();
    redirect(query ? `/login?${query}` : "/login");
  }

  return user;
}

export async function requireAdmin(): Promise<AdminUser> {
  const { isConfigured } = getSupabaseEnv();

  if (!isConfigured) {
    redirect("/login?error=supabase_not_configured");
  }

  const admin = await getAdminUser();

  if (!admin) {
    const session = await getSessionUser();
    if (session) {
      redirect("/login?error=not_admin");
    }
    redirect("/login?redirectTo=/admin");
  }

  await ensureAdminProfileRole(admin.id, admin.email);

  return admin;
}
