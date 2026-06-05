import type { CheckoutKind } from "@/types/checkout";

/** Maps public service slug → order / checkout kind */
export const SERVICE_SLUG_TO_CHECKOUT_KIND: Record<string, CheckoutKind> = {
  "ranked-boosting": "ranked_boost",
  "self-play-boosting": "self_play_boost",
  "badge-boosting": "badge_boost",
  "predator-maintenance": "predator_maintenance",
  "kills-farming": "kills_farming",
  "apex-unban": "unban_service",
  relinking: "relinking_service",
};

export function slugToCheckoutKind(slug: string): CheckoutKind | null {
  return SERVICE_SLUG_TO_CHECKOUT_KIND[slug] ?? null;
}
