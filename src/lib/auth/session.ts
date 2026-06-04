import "server-only";

import type { User } from "@supabase/supabase-js";

import { resolveRoleFromProfile } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import type { AdminUser, UserRole } from "@/types/auth";
import { isAdminRole } from "@/lib/auth/roles";

type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
  fullName: string | null;
  avatarUrl: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  const profile = await fetchProfile(supabase, user);
  const role = resolveRoleFromProfile(profile?.role, user.email);

  return {
    id: user.id,
    email: user.email,
    role,
    fullName: profile?.full_name ?? user.user_metadata?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
  };
}

async function fetchProfile(
  supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>,
  user: User
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    // profiles table may not exist yet — fall back to email allowlist
    return null;
  }

  return data;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await getSessionUser();

  if (!session || !isAdminRole(session.role)) {
    return null;
  }

  return {
    id: session.id,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
    avatarUrl: session.avatarUrl,
  };
}
