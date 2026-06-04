import type { SupabaseClient } from "@supabase/supabase-js";

import { isAdminRole, resolveRoleFromProfile } from "@/lib/auth/roles";

export async function isRequestAdmin(
  supabase: SupabaseClient,
  userId: string,
  email: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  const role = resolveRoleFromProfile(data?.role ?? null, email);
  return isAdminRole(role);
}
