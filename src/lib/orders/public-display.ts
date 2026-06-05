import type {
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
  unban_service: "Unban case",
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
      return "Weekly plan";
    case "badge_boost":
      return "1–3 days";
    case "unban_service":
      return "5–14 days";
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

export function toHeroOrderPreview(
  snapshot: PublicOrderSnapshot
): HeroOrderPreviewData {
  const active = snapshot.status === "in_progress" || snapshot.status === "paid";

  return {
    orderNumber: snapshot.orderNumber,
    isLive: true,
    services: [
      {
        label: snapshot.serviceLabel,
        status: snapshot.statusLabel,
        active,
      },
    ],
    currentRank: snapshot.currentRank,
    targetRank: snapshot.targetRank,
    serviceDetail: snapshot.serviceDetail,
    progressPercent: snapshot.progressPercent,
    etaLabel: snapshot.etaLabel,
    amountCents: snapshot.amountCents,
    currency: snapshot.currency,
  };
}

export const HERO_ORDER_PREVIEW_FALLBACK: HeroOrderPreviewData = {
  orderNumber: "WGG-2026-00421",
  isLive: false,
  services: [
    { label: "Ranked boost", status: "In progress", active: true },
    { label: "Predator plan", status: "Scheduled", active: false },
    { label: "Badge order", status: "Completed", active: false },
  ],
  currentRank: "Master",
  targetRank: "Predator",
  serviceDetail: null,
  progressPercent: 68,
  etaLabel: "2 days",
  amountCents: 19900,
  currency: "USD",
};
