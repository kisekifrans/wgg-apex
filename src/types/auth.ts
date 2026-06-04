export type UserRole = "customer" | "booster" | "admin" | "super_admin";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
};

export const ADMIN_ROLES: UserRole[] = ["admin", "super_admin"];
