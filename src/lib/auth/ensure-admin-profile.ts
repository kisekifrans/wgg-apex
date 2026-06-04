import "server-only";

import { isAdminEmail } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Persist admin role in `profiles` so Supabase RLS (`is_admin()`) matches
 * app allowlist (`ADMIN_EMAILS`). Safe to call on every admin request.
 */
export async function ensureAdminProfileRole(
  userId: string,
  email: string
): Promise<void> {
  if (!isAdminEmail(email)) {
    return;
  }

  const supabase = createAdminClient();
  await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId)
    .eq("role", "customer");
}
