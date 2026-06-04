import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { MarketplaceListingStatus } from "@/types/marketplace";

const styles: Record<MarketplaceListingStatus, string> = {
  draft: "border-white/10 bg-white/5 text-muted-foreground",
  available: "border-primary/30 bg-primary/10 text-primary",
  reserved: "border-amber-500/30 bg-amber-500/10 text-amber-200/90",
  sold: "border-white/10 bg-white/10 text-muted-foreground",
};

const labels: Record<MarketplaceListingStatus, string> = {
  draft: "Draft",
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export function ListingStatusBadge({
  status,
  className,
}: {
  status: MarketplaceListingStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-normal", styles[status], className)}
    >
      {labels[status]}
    </Badge>
  );
}
