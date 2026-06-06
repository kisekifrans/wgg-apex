import "server-only";

import { getSiteUrl } from "@/lib/site-url";

/** Discord can only embed images/avatars it can fetch over the public internet. */
export function isDiscordEmbeddableUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** Turn a CMS path or relative asset into an absolute URL for Discord embeds. */
export function resolveDiscordPublicUrl(path: string): string | undefined {
  const trimmed = path.trim();
  if (!trimmed) return undefined;

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  let absolute: string;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    absolute = trimmed;
  } else {
    absolute = `${siteUrl}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
  }

  return isDiscordEmbeddableUrl(absolute) ? absolute : undefined;
}
