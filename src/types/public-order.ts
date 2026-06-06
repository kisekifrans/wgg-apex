import type { PredatorRankProgress } from "@/types/predator";
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
  predatorProgress?: PredatorRankProgress[];
  predatorCustomRp?: number | null;
};

export type HeroDashboardOrder = {
  orderNumber: string;
  orderType: ServiceOrderType;
  serviceLabel: string;
  statusLabel: string;
  active: boolean;
  currentRank: string | null;
  targetRank: string | null;
  serviceDetail: string | null;
  progressPercent: number;
  etaLabel: string;
  amountCents: number | null;
  currency: string;
  predatorProgress?: PredatorRankProgress[];
  predatorCustomRp?: number | null;
  predatorProgressLabel?: string | null;
};

export type HeroOrderPreviewData = {
  isLive: boolean;
  orders: HeroDashboardOrder[];
};
