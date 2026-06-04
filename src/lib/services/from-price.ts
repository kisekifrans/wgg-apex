import type { CatalogPricingItem } from "@/types/services";

export function computeFromPriceCents(
  items: Pick<CatalogPricingItem, "priceCents" | "isActive">[],
  pricingEngine: string
): number | null {
  if (pricingEngine === "marketplace") return null;

  const active = items.filter((i) => i.isActive);
  if (active.length === 0) return null;

  return Math.min(...active.map((i) => i.priceCents));
}
