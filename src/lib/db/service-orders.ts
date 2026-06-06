import "server-only";

import { revealOrderMetadata } from "@/lib/security/payload-cipher";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  ServiceOrder,
  ServiceOrderFilters,
  ServiceOrderMetadata,
  ServiceOrderRevenueMetrics,
  ServiceOrderStats,
} from "@/types/orders";

type OrderRow = {
  id: string;
  order_number: string;
  order_type: ServiceOrder["orderType"];
  customer_discord: string;
  current_rank: string | null;
  target_rank: string | null;
  service_detail: string | null;
  notes: string | null;
  status: ServiceOrder["status"];
  payment_status: ServiceOrder["paymentStatus"];
  amount_cents: number | null;
  currency: string;
  customer_email: string | null;
  metadata: ServiceOrderMetadata;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  progress_percent: number;
  predator_custom_rp: number | null;
};

function mapOrder(row: OrderRow): ServiceOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    orderType: row.order_type,
    customerDiscord: row.customer_discord,
    currentRank: row.current_rank,
    targetRank: row.target_rank,
    serviceDetail: row.service_detail,
    notes: row.notes,
    status: row.status,
    paymentStatus: row.payment_status,
    amountCents: row.amount_cents,
    currency: row.currency,
    customerEmail: row.customer_email,
    progressPercent: row.progress_percent ?? 0,
    predatorCustomRp: row.predator_custom_rp ?? null,
    metadata: revealOrderMetadata(
      (row.metadata ?? {}) as Record<string, unknown>
    ) as ServiceOrderMetadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
  };
}

export async function getAdminServiceOrders(
  filters: ServiceOrderFilters = {}
): Promise<ServiceOrder[]> {
  const supabase = createAdminClient();

  let query = supabase
    .from("service_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    query = query.eq("payment_status", filters.paymentStatus);
  }

  if (filters.orderType && filters.orderType !== "all") {
    query = query.eq("order_type", filters.orderType);
  }

  if (filters.q?.trim()) {
    const safeQ = filters.q.trim().replace(/[%_,]/g, "");
    const term = `%${safeQ}%`;
    query = query.or(
      `order_number.ilike.${term},customer_discord.ilike.${term},customer_email.ilike.${term},current_rank.ilike.${term},target_rank.ilike.${term},notes.ilike.${term},service_detail.ilike.${term}`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data as OrderRow[]).map(mapOrder);
}

export async function getServiceOrderById(
  id: string
): Promise<ServiceOrder | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("service_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return mapOrder(data as OrderRow);
}

export async function getServiceOrderStats(): Promise<ServiceOrderStats> {
  const supabase = createAdminClient();

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startIso = startOfDay.toISOString();

  const [paidRes, progressRes, pendingRes, completedRes] = await Promise.all([
    supabase
      .from("service_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "paid"),
    supabase
      .from("service_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase
      .from("service_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("service_orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", startIso),
  ]);

  const err =
    paidRes.error ??
    progressRes.error ??
    pendingRes.error ??
    completedRes.error;

  if (err) {
    throw new Error(err.message);
  }

  return {
    paidAwaitingStart: paidRes.count ?? 0,
    inProgress: progressRes.count ?? 0,
    pendingCount: pendingRes.count ?? 0,
    completedToday: completedRes.count ?? 0,
  };
}

type RevenueRow = {
  amount_cents: number | null;
  payment_status: ServiceOrder["paymentStatus"];
  status: ServiceOrder["status"];
  updated_at: string;
};

export function sumOrderRevenue(
  orders: ServiceOrder[],
  predicate?: (o: ServiceOrder) => boolean
): number {
  return orders
    .filter((o) => (predicate ? predicate(o) : true))
    .filter(
      (o) =>
        o.paymentStatus === "paid" &&
        o.status !== "cancelled" &&
        o.amountCents != null
    )
    .reduce((sum, o) => sum + (o.amountCents ?? 0), 0);
}

export function computePipelineCents(orders: ServiceOrder[]): number {
  return orders
    .filter(
      (o) =>
        o.paymentStatus === "pending" &&
        o.status !== "cancelled" &&
        o.amountCents != null
    )
    .reduce((sum, o) => sum + (o.amountCents ?? 0), 0);
}

export async function getServiceOrderRevenueMetrics(): Promise<ServiceOrderRevenueMetrics> {
  const supabase = createAdminClient();

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startIso = startOfDay.toISOString();

  const { data, error } = await supabase
    .from("service_orders")
    .select("amount_cents, payment_status, status, updated_at");

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as RevenueRow[];

  let totalPaidCents = 0;
  let todayPaidCents = 0;
  let pipelineCents = 0;
  let inProgressValueCents = 0;
  let activeOrders = 0;

  for (const row of rows) {
    const amount = row.amount_cents ?? 0;
    const isCancelled = row.status === "cancelled";

    if (!isCancelled && row.status !== "completed") {
      activeOrders += 1;
    }

    if (row.payment_status === "paid" && !isCancelled && amount > 0) {
      totalPaidCents += amount;
      if (row.updated_at >= startIso) {
        todayPaidCents += amount;
      }
      if (row.status === "in_progress") {
        inProgressValueCents += amount;
      }
    }

    if (
      row.payment_status === "pending" &&
      !isCancelled &&
      amount > 0
    ) {
      pipelineCents += amount;
    }
  }

  return {
    totalPaidCents,
    todayPaidCents,
    pipelineCents,
    inProgressValueCents,
    totalOrders: rows.length,
    activeOrders,
  };
}
