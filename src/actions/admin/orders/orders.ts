"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import { generateOrderNumber } from "@/lib/orders/order-number";
import {
  applyOrderStatusChange,
  statusTimestamps,
} from "@/lib/orders/status-change";
import { progressPercentForStatus } from "@/lib/orders/progress";
import { dollarsToCents } from "@/lib/validations/marketplace";
import {
  parseAmountDollars,
  serviceOrderSchema,
} from "@/lib/validations/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ServiceOrderPaymentStatus,
  ServiceOrderStatus,
} from "@/types/orders";

const REVALIDATE_PATHS = ["/admin", "/admin/orders"];

function revalidateOrders() {
  REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function parseFormData(formData: FormData) {
  return serviceOrderSchema.safeParse({
    orderType: formData.get("orderType"),
    customerDiscord: formData.get("customerDiscord"),
    currentRank: formData.get("currentRank"),
    targetRank: formData.get("targetRank"),
    serviceDetail: formData.get("serviceDetail"),
    notes: formData.get("notes"),
    status: formData.get("status"),
    paymentStatus: formData.get("paymentStatus"),
    amountDollars: formData.get("amountDollars"),
    customerEmail: formData.get("customerEmail"),
  });
}

function rowFromInput(
  input: ReturnType<typeof serviceOrderSchema.parse>,
  orderNumber?: string
) {
  const amount = parseAmountDollars(input.amountDollars);
  const timestamps = statusTimestamps(input.status);

  return {
    ...(orderNumber ? { order_number: orderNumber } : {}),
    order_type: input.orderType,
    customer_discord: input.customerDiscord.trim(),
    current_rank: emptyToNull(input.currentRank ?? undefined),
    target_rank: emptyToNull(input.targetRank ?? undefined),
    service_detail: emptyToNull(input.serviceDetail ?? undefined),
    notes: emptyToNull(input.notes ?? undefined),
    status: input.status,
    payment_status: input.paymentStatus,
    amount_cents: amount !== null ? dollarsToCents(amount) : null,
    customer_email: emptyToNull(input.customerEmail ?? undefined),
    progress_percent: progressPercentForStatus(input.status),
    ...timestamps,
  };
}

export async function createServiceOrder(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const supabase = createAdminClient();
  const orderNumber = await generateOrderNumber();

  const { data: order, error } = await supabase
    .from("service_orders")
    .insert({
      ...rowFromInput(parsed.data, orderNumber),
      created_by: admin.id,
    })
    .select("id")
    .single();

  if (error || !order) {
    return { success: false, error: error?.message ?? "Failed to create order" };
  }

  revalidateOrders();
  revalidatePath(`/admin/orders/${order.id}`);
  redirect(`/admin/orders/${order.id}`);
}

export async function updateServiceOrder(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("service_orders")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  const statusChanged =
    existing?.status && existing.status !== parsed.data.status;

  if (statusChanged) {
    const statusResult = await applyOrderStatusChange(id, parsed.data.status);
    if (!statusResult.success) {
      return statusResult;
    }

    const { status: _status, ...rest } = rowFromInput(parsed.data);
    const { error } = await supabase.from("service_orders").update(rest).eq("id", id);
    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("service_orders")
      .update(rowFromInput(parsed.data))
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  revalidateOrders();
  revalidatePath(`/admin/orders/${id}`);
  return { success: true, data: undefined };
}

export async function deleteServiceOrder(
  id: string
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();

  const { error } = await supabase.from("service_orders").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateOrders();
  redirect("/admin/orders");
}

export async function quickUpdateOrderStatus(
  id: string,
  status: ServiceOrderStatus
): Promise<ActionResult> {
  await requireAdmin();

  const result = await applyOrderStatusChange(id, status);
  if (!result.success) {
    return result;
  }

  revalidateOrders();
  revalidatePath(`/admin/orders/${id}`);
  return { success: true, data: undefined };
}

export async function quickUpdateOrderPayment(
  id: string,
  paymentStatus: ServiceOrderPaymentStatus
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("service_orders")
    .update({ payment_status: paymentStatus })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateOrders();
  revalidatePath(`/admin/orders/${id}`);
  return { success: true, data: undefined };
}

export async function updateOrderNotes(
  id: string,
  notes: string
): Promise<ActionResult> {
  await requireAdmin();

  const trimmed = notes.trim();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("service_orders")
    .update({ notes: trimmed ? trimmed : null })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateOrders();
  revalidatePath(`/admin/orders/${id}`);
  return { success: true, data: undefined };
}
