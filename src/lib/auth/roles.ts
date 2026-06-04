import type { UserRole } from "@/types/auth";
import { ADMIN_ROLES } from "@/types/auth";

export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role as UserRole);
}

export function resolveRoleFromProfile(
  profileRole: string | null | undefined,
  email: string
): UserRole {
  if (profileRole && isValidRole(profileRole)) {
    return profileRole as UserRole;
  }

  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());

  if (allowlist.includes(email.toLowerCase())) {
    return "admin";
  }

  return "customer";
}

function isValidRole(role: string): role is UserRole {
  return ["customer", "booster", "admin", "super_admin"].includes(role);
}
