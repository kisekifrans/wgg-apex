export const SERVICE_ORDER_TYPES = [
  "ranked_boost",
  "self_play_boost",
  "badge_boost",
  "predator_maintenance",
  "unban_service",
  "marketplace",
] as const;

export type ServiceOrderType = (typeof SERVICE_ORDER_TYPES)[number];

export const SERVICE_ORDER_STATUSES = [
  "pending",
  "paid",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type ServiceOrderStatus = (typeof SERVICE_ORDER_STATUSES)[number];

export const SERVICE_ORDER_PAYMENT_STATUSES = [
  "pending",
  "paid",
  "refunded",
  "failed",
] as const;

export type ServiceOrderPaymentStatus =
  (typeof SERVICE_ORDER_PAYMENT_STATUSES)[number];

export type ServiceOrderMetadata = {
  unban?: {
    eaLoginId?: string | null;
    eaEmail?: string | null;
    banDate?: string | null;
    previousAppeals?: string | null;
    additionalNotes?: string | null;
  } | null;
  predator?: {
    nintendoEmail?: string | null;
    nintendoPassword?: string | null;
    nintendoBackupCode?: string | null;
    eaEmail?: string | null;
    eaPassword?: string | null;
    eaBackupCode?: string | null;
  } | null;
};

export type ServiceOrder = {
  id: string;
  orderNumber: string;
  orderType: ServiceOrderType;
  customerDiscord: string;
  currentRank: string | null;
  targetRank: string | null;
  serviceDetail: string | null;
  notes: string | null;
  status: ServiceOrderStatus;
  paymentStatus: ServiceOrderPaymentStatus;
  amountCents: number | null;
  currency: string;
  customerEmail: string | null;
  progressPercent: number;
  metadata: ServiceOrderMetadata;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
};

export type ServiceOrderFilters = {
  q?: string;
  status?: ServiceOrderStatus | "all";
  paymentStatus?: ServiceOrderPaymentStatus | "all";
  orderType?: ServiceOrderType | "all";
};

export type ServiceOrderStats = {
  paidAwaitingStart: number;
  inProgress: number;
  pendingCount: number;
  completedToday: number;
};

export type ServiceOrderRevenueMetrics = {
  totalPaidCents: number;
  todayPaidCents: number;
  pipelineCents: number;
  inProgressValueCents: number;
  totalOrders: number;
  activeOrders: number;
};
