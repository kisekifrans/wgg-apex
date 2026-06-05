/**
 * Canonical customer-facing destinations per service slug.
 * Overrides stale `services.href` values from the database.
 */
export const SERVICE_LINKS: Record<string, string> = {
  "ranked-boosting": "#rank-pricing",
  "self-play-boosting": "#self-play-boosting",
  "predator-maintenance": "/services/predator-maintenance",
  "badge-boosting": "#badges",
  "apex-unban": "/services/apex-unban",
  "account-marketplace": "/marketplace",
  "kills-farming": "/checkout/kills-farming",
  "mythic-prestige-damage": "/checkout/mythic-prestige-damage",
  relinking: "/services/relinking",
};

/** Services with a dedicated intake page (not generic checkout slug). */
export const SERVICE_INTAKE_SLUGS = new Set([
  "predator-maintenance",
  "apex-unban",
  "relinking",
]);

export function getServiceLinkHref(
  slug: string,
  fallbackHref?: string | null
): string {
  const fallback = fallbackHref?.trim();
  return SERVICE_LINKS[slug] ?? (fallback || "#services");
}

export function getServiceIntakeHref(
  slug: string,
  query?: Record<string, string>
): string | null {
  if (!SERVICE_INTAKE_SLUGS.has(slug)) return null;

  const base = `/services/${slug}`;
  if (!query || Object.keys(query).length === 0) return base;

  const params = new URLSearchParams(query);
  return `${base}?${params.toString()}`;
}
