import type {
  HeroDashboardOrder,
  HeroOrderPreviewData,
  PublicOrderSnapshot,
} from "@/types/public-order";
import type {
  ServiceOrderPaymentStatus,
  ServiceOrderStatus,
  ServiceOrderType,
} from "@/types/orders";

const ORDER_TYPE_LABELS: Record<ServiceOrderType, string> = {
  ranked_boost: "Ranked boost",
  self_play_boost: "Duo ranked boost",
  badge_boost: "Badge order",
  predator_maintenance: "Predator plan",
  kills_farming: "Kills farming",
  unban_service: "Unban case",
  relinking_service: "Account relinking",
  marketplace: "Marketplace purchase",
};

const PAYMENT_LABELS: Record<ServiceOrderPaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

const STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  pending: "Pending",
  paid: "Queued",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function getOrderTypeLabel(orderType: ServiceOrderType): string {
  return ORDER_TYPE_LABELS[orderType];
}

export function getCustomerStatusLabel(status: ServiceOrderStatus): string {
  return STATUS_LABELS[status];
}

export function getProgressPercent(
  status: ServiceOrderStatus,
  storedPercent?: number | null
): number {
  if (
    typeof storedPercent === "number" &&
    storedPercent >= 0 &&
    storedPercent <= 100
  ) {
    return storedPercent;
  }
  switch (status) {
    case "pending":
      return 5;
    case "paid":
      return 20;
    case "in_progress":
      return 68;
    case "completed":
      return 100;
    case "cancelled":
      return 0;
    default:
      return 0;
  }
}

export function getEtaLabel(
  orderType: ServiceOrderType,
  status: ServiceOrderStatus
): string {
  if (status === "completed") return "Completed";
  if (status === "cancelled") return "Cancelled";
  if (status === "paid") return "Assigning operator";

  switch (orderType) {
    case "predator_maintenance":
      return "RP maintenance";
    case "kills_farming":
      return "1–5 days";
    case "badge_boost":
      return "1–3 days";
    case "unban_service":
      return "5–14 days";
    case "relinking_service":
      return "1–3 days";
    case "marketplace":
      return "Transfer pending";
    default:
      return "2–5 days";
  }
}

export function toPublicOrderSnapshot(order: {
  orderNumber: string;
  orderType: ServiceOrderType;
  currentRank: string | null;
  targetRank: string | null;
  serviceDetail: string | null;
  status: ServiceOrderStatus;
  paymentStatus: ServiceOrderPaymentStatus;
  progressPercent?: number | null;
  amountCents: number | null;
  currency: string;
  updatedAt: string;
  completedAt: string | null;
  timeline?: PublicOrderSnapshot["timeline"];
}): PublicOrderSnapshot {
  return {
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    serviceLabel: getOrderTypeLabel(order.orderType),
    status: order.status,
    paymentStatus: order.paymentStatus,
    statusLabel: getCustomerStatusLabel(order.status),
    paymentLabel: PAYMENT_LABELS[order.paymentStatus],
    currentRank: order.currentRank,
    targetRank: order.targetRank,
    serviceDetail: order.serviceDetail,
    amountCents: order.amountCents,
    currency: order.currency,
    progressPercent: getProgressPercent(order.status, order.progressPercent),
    timeline: order.timeline ?? [],
    etaLabel: getEtaLabel(order.orderType, order.status),
    updatedAt: order.updatedAt,
    completedAt: order.completedAt,
  };
}

const HERO_DASHBOARD_DEMO_ORDERS: HeroDashboardOrder[] = [
  {
    orderNumber: "ORD-2026-00006",
    orderType: "predator_maintenance",
    serviceLabel: "Predator plan",
    statusLabel: "In progress",
    active: true,
    currentRank: null,
    targetRank: null,
    serviceDetail: "Core",
    progressPercent: 50,
    etaLabel: "RP maintenance",
    amountCents: 18500,
    currency: "USD",
  },
  {
    orderNumber: "ORD-2026-00012",
    orderType: "ranked_boost",
    serviceLabel: "Ranked boost",
    statusLabel: "In progress",
    active: true,
    currentRank: "Gold IV",
    targetRank: "Platinum IV",
    serviceDetail: null,
    progressPercent: 62,
    etaLabel: "3–5 days",
    amountCents: 1600,
    currency: "USD",
  },
  {
    orderNumber: "ORD-2026-00009",
    orderType: "self_play_boost",
    serviceLabel: "Duo ranked boost",
    statusLabel: "Queued",
    active: true,
    currentRank: "Silver IV",
    targetRank: "Gold IV",
    serviceDetail: null,
    progressPercent: 20,
    etaLabel: "Assigning operator",
    amountCents: 2600,
    currency: "USD",
  },
  {
    orderNumber: "ORD-2026-00004",
    orderType: "predator_maintenance",
    serviceLabel: "Predator plan",
    statusLabel: "In progress",
    active: true,
    currentRank: null,
    targetRank: null,
    serviceDetail: "Pro",
    progressPercent: 74,
    etaLabel: "RP maintenance",
    amountCents: 26500,
    currency: "USD",
  },
  {
    orderNumber: "ORD-2026-00018",
    orderType: "ranked_boost",
    serviceLabel: "Ranked boost",
    statusLabel: "In progress",
    active: true,
    currentRank: "Diamond IV",
    targetRank: "Master",
    serviceDetail: null,
    progressPercent: 41,
    etaLabel: "5–8 days",
    amountCents: 4500,
    currency: "USD",
  },
];

export function formatHeroServiceDetail(
  detail: string | null | undefined
): string | null {
  if (!detail) return null;
  const cleaned = detail.replace(/\s*·?\s*per\s+week/gi, "").trim();
  return cleaned || null;
}

function snapshotToDashboardOrder(
  snapshot: PublicOrderSnapshot
): HeroDashboardOrder {
  const active =
    snapshot.status === "in_progress" || snapshot.status === "paid";

  return {
    orderNumber: snapshot.orderNumber,
    orderType: snapshot.orderType,
    serviceLabel: snapshot.serviceLabel,
    statusLabel: snapshot.statusLabel,
    active,
    currentRank: snapshot.currentRank,
    targetRank: snapshot.targetRank,
    serviceDetail: formatHeroServiceDetail(snapshot.serviceDetail),
    progressPercent: snapshot.progressPercent,
    etaLabel: snapshot.etaLabel,
    amountCents: snapshot.amountCents,
    currency: snapshot.currency,
  };
}

const HERO_DASHBOARD_MIN_ORDERS = 5;

export function buildHeroDashboardPreview(
  snapshots: PublicOrderSnapshot[]
): HeroOrderPreviewData {
  const seen = new Set<string>();
  const orders: HeroDashboardOrder[] = [];

  for (const snapshot of snapshots) {
    if (orders.length >= HERO_DASHBOARD_MIN_ORDERS) break;
    if (seen.has(snapshot.orderNumber)) continue;
    seen.add(snapshot.orderNumber);
    orders.push(snapshotToDashboardOrder(snapshot));
  }

  for (const demo of HERO_DASHBOARD_DEMO_ORDERS) {
    if (orders.length >= HERO_DASHBOARD_MIN_ORDERS) break;
    if (seen.has(demo.orderNumber)) continue;
    seen.add(demo.orderNumber);
    orders.push(demo);
  }

  return {
    isLive: snapshots.length > 0,
    orders,
  };
}

/** @deprecated Use buildHeroDashboardPreview — kept for single-order call sites */
export function toHeroOrderPreview(
  snapshot: PublicOrderSnapshot
): HeroOrderPreviewData {
  return buildHeroDashboardPreview([snapshot]);
}

export const HERO_ORDER_PREVIEW_FALLBACK: HeroOrderPreviewData =
  buildHeroDashboardPreview([]);
