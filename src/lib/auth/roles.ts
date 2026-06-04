import type { UserRole } from "@/types/auth";
import { ADMIN_ROLES } from "@/types/auth";
import { getAdminEmails } from "@/lib/supabase/env";

export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role as UserRole);
}

export function isAdminEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return getAdminEmails().includes(normalized);
}

/** DB role wins for admin/super_admin; ADMIN_EMAILS elevates allowlisted users. */
export function resolveRoleFromProfile(
  profileRole: string | null | undefined,
  email: string
): UserRole {
  if (profileRole && isAdminRole(profileRole)) {
    return profileRole as UserRole;
  }

  if (isAdminEmail(email)) {
    return "admin";
  }

  if (profileRole && isValidRole(profileRole)) {
    return profileRole as UserRole;
  }

  return "customer";
}

function isValidRole(role: string): role is UserRole {
  return ["customer", "booster", "admin", "super_admin"].includes(role);
}
