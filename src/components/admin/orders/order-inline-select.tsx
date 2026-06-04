"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  quickUpdateOrderPayment,
  quickUpdateOrderStatus,
} from "@/actions/admin/orders/orders";
import { ORDER_PAYMENT_STATUS_LABELS, ORDER_STATUS_LABELS } from "@/config/orders";
import { cn } from "@/lib/utils";
import {
  SERVICE_ORDER_PAYMENT_STATUSES,
  SERVICE_ORDER_STATUSES,
  type ServiceOrderPaymentStatus,
  type ServiceOrderStatus,
} from "@/types/orders";

type OrderInlineSelectProps = {
  orderId: string;
  field: "status" | "payment";
  value: ServiceOrderStatus | ServiceOrderPaymentStatus;
};

export function OrderInlineSelect({
  orderId,
  field,
  value,
}: OrderInlineSelectProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const options =
    field === "status"
      ? SERVICE_ORDER_STATUSES.map((s) => ({
          value: s,
          label: ORDER_STATUS_LABELS[s],
        }))
      : SERVICE_ORDER_PAYMENT_STATUSES.map((s) => ({
          value: s,
          label: ORDER_PAYMENT_STATUS_LABELS[s],
        }));

  function handleChange(next: string) {
    startTransition(async () => {
      const result =
        field === "status"
          ? await quickUpdateOrderStatus(
              orderId,
              next as ServiceOrderStatus
            )
          : await quickUpdateOrderPayment(
              orderId,
              next as ServiceOrderPaymentStatus
            );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(
        field === "status" ? "Status updated" : "Payment status updated"
      );
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "max-w-full cursor-pointer rounded-md border border-white/10 bg-background/80 px-2 py-1 text-xs font-medium outline-none",
        "focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20",
        pending && "opacity-50"
      )}
      aria-label={field === "status" ? "Order status" : "Payment status"}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
