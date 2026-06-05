import { getBundleDisplayRanks } from "@/config/ranked-bundles";
import { RankIcon } from "@/components/shared/rank-icon";
import type { CatalogPricingItem } from "@/types/services";

type BundleRankSpanProps = {
  item: CatalogPricingItem;
};

export function BundleRankSpan({ item }: BundleRankSpanProps) {
  const { from, to, label } = getBundleDisplayRanks(item);

  return (
    <div className="flex items-center gap-2 font-medium">
      <RankIcon tier={from} size="md" />
      <span className="whitespace-nowrap">{label}</span>
      <RankIcon tier={to} size="md" />
    </div>
  );
}
