import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Supabase client for public catalog/marketing reads.
 * Prefers the cookie-aware anon client, then a cookieless anon client (build/SSG),
 * then the service role only as a last resort.
 */
export async function getPublicDataClient(): Promise<SupabaseClient> {
  const fromCookies = await createClient();
  if (fromCookies) return fromCookies;

  const { url, anonKey, isConfigured } = getSupabaseEnv();
  if (isConfigured && url && anonKey) {
    return createSupabaseClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return createAdminClient();
}
