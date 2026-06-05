import "server-only";

import { toPublicOrderSnapshot } from "@/lib/orders/public-display";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicOrderSnapshot } from "@/types/public-order";
import type {
  ServiceOrderPaymentStatus,
  ServiceOrderStatus,
  ServiceOrderType,
} from "@/types/orders";

type PublicOrderRow = {
  order_number: string;
  order_type: ServiceOrderType;
  customer_email: string | null;
  current_rank: string | null;
  target_rank: string | null;
  service_detail: string | null;
  status: ServiceOrderStatus;
  payment_status: ServiceOrderPaymentStatus;
  amount_cents: number | null;
  currency: string;
  updated_at: string;
  completed_at: string | null;
};

function mapPublicRow(row: PublicOrderRow): PublicOrderSnapshot {
  return toPublicOrderSnapshot({
    orderNumber: row.order_number,
    orderType: row.order_type,
    currentRank: row.current_rank,
    targetRank: row.target_rank,
    serviceDetail: row.service_detail,
    status: row.status,
    paymentStatus: row.payment_status,
    amountCents: row.amount_cents,
    currency: row.currency,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  });
}

const PUBLIC_ORDER_COLUMNS =
  "order_number, order_type, customer_email, current_rank, target_rank, service_detail, status, payment_status, amount_cents, currency, updated_at, completed_at";

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

    return mapPublicRow(data as PublicOrderRow);
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

    return mapPublicRow(row);
  } catch {
    return null;
  }
}
