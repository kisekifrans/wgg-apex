import type { ServiceOrderStatus } from "@/types/orders";

export function progressPercentForStatus(status: ServiceOrderStatus): number {
  switch (status) {
    case "pending":
      return 5;
    case "paid":
      return 20;
    case "in_progress":
      return 50;
    case "completed":
      return 100;
    case "cancelled":
      return 0;
    default:
      return 0;
  }
}

export function timelineMessageForStatus(
  status: ServiceOrderStatus
): string {
  switch (status) {
    case "pending":
      return "Order received — awaiting payment";
    case "paid":
      return "Payment confirmed — assigning operator";
    case "in_progress":
      return "Operator assigned — boost in progress";
    case "completed":
      return "Order completed";
    case "cancelled":
      return "Order cancelled";
    default:
      return "Status updated";
  }
}
