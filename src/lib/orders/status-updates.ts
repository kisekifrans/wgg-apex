import "server-only";

import {
  progressPercentForStatus,
  timelineMessageForStatus,
} from "@/lib/orders/progress";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ServiceOrderStatus } from "@/types/orders";

export type OrderStatusUpdateRow = {
  id: string;
  order_id: string;
  status: ServiceOrderStatus;
  progress_percent: number | null;
  message: string | null;
  is_customer_visible: boolean;
  created_at: string;
};

export type OrderTimelineEntry = {
  status: ServiceOrderStatus;
  statusLabel: string;
  message: string;
  progressPercent: number | null;
  createdAt: string;
};

const STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export async function recordOrderStatusUpdate(
  orderId: string,
  status: ServiceOrderStatus,
  options?: {
    message?: string;
    progressPercent?: number;
    customerVisible?: boolean;
  }
): Promise<void> {
  const supabase = createAdminClient();
  const progress =
    options?.progressPercent ?? progressPercentForStatus(status);
  const message = options?.message ?? timelineMessageForStatus(status);

  const { error: insertError } = await supabase
    .from("order_status_updates")
    .insert({
      order_id: orderId,
      status,
      progress_percent: progress,
      message,
      is_customer_visible: options?.customerVisible ?? true,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  const { error: updateError } = await supabase
    .from("service_orders")
    .update({ progress_percent: progress })
    .eq("id", orderId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

export async function getCustomerOrderTimeline(
  orderId: string
): Promise<OrderTimelineEntry[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("order_status_updates")
    .select("status, progress_percent, message, created_at")
    .eq("order_id", orderId)
    .eq("is_customer_visible", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as Pick<
    OrderStatusUpdateRow,
    "status" | "progress_percent" | "message" | "created_at"
  >[]).map((row) => ({
    status: row.status,
    statusLabel: STATUS_LABELS[row.status],
    message: row.message ?? timelineMessageForStatus(row.status),
    progressPercent: row.progress_percent,
    createdAt: row.created_at,
  }));
}
