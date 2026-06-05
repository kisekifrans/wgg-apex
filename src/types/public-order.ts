import type {
  ServiceOrderPaymentStatus,
  ServiceOrderStatus,
  ServiceOrderType,
} from "@/types/orders";

export type PublicOrderTimelineEntry = {
  status: ServiceOrderStatus;
  statusLabel: string;
  message: string;
  progressPercent: number | null;
  createdAt: string;
};

/** Safe fields for hero widget and customer order lookup (no credentials). */
export type PublicOrderSnapshot = {
  orderNumber: string;
  orderType: ServiceOrderType;
  serviceLabel: string;
  status: ServiceOrderStatus;
  paymentStatus: ServiceOrderPaymentStatus;
  statusLabel: string;
  paymentLabel: string;
  currentRank: string | null;
  targetRank: string | null;
  serviceDetail: string | null;
  amountCents: number | null;
  currency: string;
  progressPercent: number;
  etaLabel: string;
  updatedAt: string;
  completedAt: string | null;
  timeline: PublicOrderTimelineEntry[];
};

export type HeroOrderPreviewData = {
  orderNumber: string;
  isLive: boolean;
  services: { label: string; status: string; active: boolean }[];
  currentRank: string | null;
  targetRank: string | null;
  serviceDetail: string | null;
  progressPercent: number;
  etaLabel: string;
  amountCents: number | null;
  currency: string;
};
