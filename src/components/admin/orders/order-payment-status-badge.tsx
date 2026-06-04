import { Badge } from "@/components/ui/badge";
import { ORDER_PAYMENT_STATUS_LABELS } from "@/config/orders";
import { cn } from "@/lib/utils";
import type { ServiceOrderPaymentStatus } from "@/types/orders";

const paymentStyles: Record<ServiceOrderPaymentStatus, string> = {
  pending: "border-white/10 bg-white/5 text-muted-foreground",
  paid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200/90",
  refunded: "border-amber-500/30 bg-amber-500/10 text-amber-200/90",
  failed: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function OrderPaymentStatusBadge({
  status,
}: {
  status: ServiceOrderPaymentStatus;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", paymentStyles[status])}
    >
      {ORDER_PAYMENT_STATUS_LABELS[status]}
    </Badge>
  );
}
