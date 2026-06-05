import "server-only";

import { headers } from "next/headers";

import { getSiteUrl } from "@/lib/stripe/env";

/** Origin for auth redirects — matches the host the user is actually on (www vs apex). */
export async function getRequestOrigin(): Promise<string> {
  const headersList = await headers();
  const host =
    headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const proto = headersList.get("x-forwarded-proto") ?? "https";

  if (host) {
    return `${proto}://${host.split(",")[0]?.trim()}`;
  }

  return getSiteUrl();
}

export function buildAuthCallbackUrl(
  origin: string,
  redirectPath = "/account"
): string {
  const redirectTo = encodeURIComponent(redirectPath);
  return `${origin.replace(/\/$/, "")}/api/auth/callback?redirectTo=${redirectTo}`;
}
