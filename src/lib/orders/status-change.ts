import "server-only";

import { ORDER_STATUS_LABELS } from "@/config/orders";
import { sendOrderStatusUpdateEmail } from "@/lib/email/send-order-status-update";
import { getServiceOrderById } from "@/lib/db/service-orders";
import { getOrderTypeLabel } from "@/lib/orders/public-display";
import {
  progressPercentForStatus,
  timelineMessageForStatus,
} from "@/lib/orders/progress";
import { recordOrderStatusUpdate } from "@/lib/orders/status-updates";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ServiceOrderStatus } from "@/types/orders";

export function statusTimestamps(status: ServiceOrderStatus): {
  completed_at: string | null;
  cancelled_at: string | null;
} {
  const now = new Date().toISOString();
  return {
    completed_at: status === "completed" ? now : null,
    cancelled_at: status === "cancelled" ? now : null,
  };
}

export async function applyOrderStatusChange(
  orderId: string,
  newStatus: ServiceOrderStatus,
  options?: { notifyCustomer?: boolean }
): Promise<{ success: true } | { success: false; error: string }> {
  const order = await getServiceOrderById(orderId);
  if (!order) {
    return { success: false, error: "Order not found" };
  }

  const previousStatus = order.status;
  if (previousStatus === newStatus) {
    return { success: true };
  }

  const progress = progressPercentForStatus(newStatus);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("service_orders")
    .update({
      status: newStatus,
      progress_percent: progress,
      ...statusTimestamps(newStatus),
    })
    .eq("id", orderId);

  if (error) {
    return { success: false, error: error.message };
  }

  const message = timelineMessageForStatus(newStatus);
  await recordOrderStatusUpdate(orderId, newStatus, {
    message,
    progressPercent: progress,
  });

  if (
    options?.notifyCustomer !== false &&
    order.customerEmail &&
    order.paymentStatus === "paid"
  ) {
    await sendOrderStatusUpdateEmail({
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      serviceName: order.serviceDetail ?? getOrderTypeLabel(order.orderType),
      customerEmail: order.customerEmail,
      previousStatus,
      newStatus,
      statusLabel: ORDER_STATUS_LABELS[newStatus],
      progressPercent: progress,
      message,
    });
  }

  return { success: true };
}
