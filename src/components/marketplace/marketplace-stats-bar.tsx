import type { MarketplaceListing } from "@/types/marketplace";

export function MarketplaceStatsBar({
  listings,
}: {
  listings: MarketplaceListing[];
}) {
  const available = listings.filter((l) => l.status === "available").length;
  const sold = listings.filter((l) => l.status === "sold").length;
  const reserved = listings.filter((l) => l.status === "reserved").length;

  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
      <span>
        <strong className="font-mono text-foreground">{listings.length}</strong>{" "}
        listings
      </span>
      <span>
        <strong className="font-mono text-primary">{available}</strong> available
      </span>
      {reserved > 0 && (
        <span>
          <strong className="font-mono text-amber-200/90">{reserved}</strong> reserved
        </span>
      )}
      {sold > 0 && (
        <span>
          <strong className="font-mono text-foreground">{sold}</strong> sold — social
          proof
        </span>
      )}
    </div>
  );
}
