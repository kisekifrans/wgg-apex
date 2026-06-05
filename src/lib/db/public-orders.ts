import "server-only";

import { normalizeDiscordHandle } from "@/lib/orders/discord";
import { toPublicOrderSnapshot } from "@/lib/orders/public-display";
import { getCustomerOrderTimeline } from "@/lib/orders/status-updates";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicOrderSnapshot } from "@/types/public-order";
import type {
  ServiceOrderPaymentStatus,
  ServiceOrderStatus,
  ServiceOrderType,
} from "@/types/orders";

type PublicOrderRow = {
  id: string;
  order_number: string;
  order_type: ServiceOrderType;
  customer_discord: string;
  customer_email: string | null;
  current_rank: string | null;
  target_rank: string | null;
  service_detail: string | null;
  status: ServiceOrderStatus;
  payment_status: ServiceOrderPaymentStatus;
  progress_percent: number;
  amount_cents: number | null;
  currency: string;
  updated_at: string;
  completed_at: string | null;
};

async function mapPublicRow(
  row: PublicOrderRow,
  orderId: string
): Promise<PublicOrderSnapshot> {
  let timeline: Awaited<ReturnType<typeof getCustomerOrderTimeline>> = [];
  try {
    timeline = await getCustomerOrderTimeline(orderId);
  } catch {
    timeline = [];
  }

  return toPublicOrderSnapshot({
    orderNumber: row.order_number,
    orderType: row.order_type,
    currentRank: row.current_rank,
    targetRank: row.target_rank,
    serviceDetail: row.service_detail,
    status: row.status,
    paymentStatus: row.payment_status,
    progressPercent: row.progress_percent,
    amountCents: row.amount_cents,
    currency: row.currency,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    timeline,
  });
}

const PUBLIC_ORDER_COLUMNS =
  "id, order_number, order_type, customer_discord, customer_email, current_rank, target_rank, service_detail, status, payment_status, progress_percent, amount_cents, currency, updated_at, completed_at";

/** Most recent paid order for homepage hero (no PII beyond order number). */
export async function getRecentPublicHeroOrder(): Promise<PublicOrderSnapshot | null> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("service_orders")
      .select(PUBLIC_ORDER_COLUMNS)
      .eq("payment_status", "paid")
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return mapPublicRow(data as PublicOrderRow, data.id);
  } catch {
    return null;
  }
}

export function normalizeOrderNumber(input: string): string {
  return input.trim().toUpperCase();
}

export function normalizeLookupEmail(input: string): string {
  return input.trim().toLowerCase();
}

/** Customer lookup — requires both order number and matching email. */
export async function lookupPublicOrder(
  orderNumber: string,
  email: string
): Promise<PublicOrderSnapshot | null> {
  const normalizedNumber = normalizeOrderNumber(orderNumber);
  const normalizedEmail = normalizeLookupEmail(email);

  if (!normalizedNumber || !normalizedEmail) {
    return null;
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("service_orders")
      .select(PUBLIC_ORDER_COLUMNS)
      .eq("order_number", normalizedNumber)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as PublicOrderRow;
    const rowEmail = row.customer_email?.trim().toLowerCase() ?? "";

    if (!rowEmail || rowEmail !== normalizedEmail) {
      return null;
    }

    return mapPublicRow(row, row.id);
  } catch {
    return null;
  }
}

/** Customer lookup — order number + Discord handle (checkout username). */
export async function lookupPublicOrderByDiscord(
  orderNumber: string,
  discord: string
): Promise<PublicOrderSnapshot | null> {
  const normalizedNumber = normalizeOrderNumber(orderNumber);
  const normalizedDiscord = normalizeDiscordHandle(discord);

  if (!normalizedNumber || !normalizedDiscord) {
    return null;
  }

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("service_orders")
      .select(PUBLIC_ORDER_COLUMNS)
      .eq("order_number", normalizedNumber)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as PublicOrderRow;
    const rowDiscord = normalizeDiscordHandle(row.customer_discord ?? "");

    if (!rowDiscord || rowDiscord !== normalizedDiscord) {
      return null;
    }

    return mapPublicRow(row, row.id);
  } catch {
    return null;
  }
}

/** Orders for a signed-in customer (matches checkout email). */
export async function listCustomerOrders(
  email: string
): Promise<PublicOrderSnapshot[]> {
  const normalizedEmail = normalizeLookupEmail(email);
  if (!normalizedEmail) return [];

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("service_orders")
      .select(PUBLIC_ORDER_COLUMNS)
      .ilike("customer_email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data?.length) return [];

    const rows = await Promise.all(
      (data as PublicOrderRow[]).map((row) => mapPublicRow(row, row.id))
    );

    return rows;
  } catch {
    return [];
  }
}

/** Single order for account detail — must match customer email. */
export async function getCustomerOrderByNumber(
  email: string,
  orderNumber: string
): Promise<PublicOrderSnapshot | null> {
  const normalizedEmail = normalizeLookupEmail(email);
  const normalizedNumber = normalizeOrderNumber(orderNumber);

  if (!normalizedEmail || !normalizedNumber) return null;

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("service_orders")
      .select(PUBLIC_ORDER_COLUMNS)
      .eq("order_number", normalizedNumber)
      .maybeSingle();

    if (error || !data) return null;

    const row = data as PublicOrderRow;
    const rowEmail = row.customer_email?.trim().toLowerCase() ?? "";

    if (!rowEmail || rowEmail !== normalizedEmail) {
      return null;
    }

    return mapPublicRow(row, row.id);
  } catch {
    return null;
  }
}
