import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/config/orders";
import { cn } from "@/lib/utils";
import type { ServiceOrderStatus } from "@/types/orders";

const statusStyles: Record<ServiceOrderStatus, string> = {
  pending: "border-white/10 bg-white/5 text-muted-foreground",
  paid: "border-primary/30 bg-primary/10 text-primary",
  in_progress: "border-amber-500/30 bg-amber-500/10 text-amber-200/90",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200/90",
  cancelled: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function OrderStatusBadge({ status }: { status: ServiceOrderStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", statusStyles[status])}
    >
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
