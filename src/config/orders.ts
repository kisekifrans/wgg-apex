import type {
  ServiceOrderPaymentStatus,
  ServiceOrderStatus,
  ServiceOrderType,
} from "@/types/orders";

export const ORDER_TYPE_LABELS: Record<ServiceOrderType, string> = {
  ranked_boost: "Ranked Boost",
  self_play_boost: "Duo Ranked Boost",
  badge_boost: "Badge Boost",
  predator_maintenance: "Predator Maintenance",
  unban_service: "Unban Service",
  marketplace: "Account Marketplace",
};

export const ORDER_STATUS_LABELS: Record<ServiceOrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_PAYMENT_STATUS_LABELS: Record<
  ServiceOrderPaymentStatus,
  string
> = {
  pending: "Pending",
  paid: "Paid",
  refunded: "Refunded",
  failed: "Failed",
};

/** Apex rank ladder for current / target rank selects */
export const ORDER_RANK_OPTIONS = [
  "Bronze IV",
  "Bronze III",
  "Bronze II",
  "Bronze I",
  "Silver IV",
  "Silver III",
  "Silver II",
  "Silver I",
  "Gold IV",
  "Gold III",
  "Gold II",
  "Gold I",
  "Platinum IV",
  "Platinum III",
  "Platinum II",
  "Platinum I",
  "Diamond IV",
  "Diamond III",
  "Diamond II",
  "Diamond I",
  "Master",
  "Predator",
] as const;

export const PREDATOR_PLAN_OPTIONS = [
  "Core — $199/wk",
  "Pro — $349/wk",
  "Elite — $549/wk",
] as const;

export const BADGE_OPTIONS = [
  "Apex Predator Badge",
  "4000 Damage Badge",
  "20 Kill Badge",
  "Legend-Specific Master",
  "Event Collection Badge",
  "Other (see notes)",
] as const;

export type OrderFieldConfig = {
  showCurrentRank: boolean;
  showTargetRank: boolean;
  showServiceDetail: boolean;
  currentRankLabel: string;
  targetRankLabel: string;
  serviceDetailLabel: string;
  requireCurrentRank: boolean;
  requireTargetRank: boolean;
  requireServiceDetail: boolean;
};

export const ORDER_TYPE_FIELDS: Record<ServiceOrderType, OrderFieldConfig> = {
  ranked_boost: {
    showCurrentRank: true,
    showTargetRank: true,
    showServiceDetail: false,
    currentRankLabel: "Current rank",
    targetRankLabel: "Target rank",
    serviceDetailLabel: "",
    requireCurrentRank: true,
    requireTargetRank: true,
    requireServiceDetail: false,
  },
  self_play_boost: {
    showCurrentRank: true,
    showTargetRank: true,
    showServiceDetail: false,
    currentRankLabel: "Current rank",
    targetRankLabel: "Target rank",
    serviceDetailLabel: "",
    requireCurrentRank: true,
    requireTargetRank: true,
    requireServiceDetail: false,
  },
  badge_boost: {
    showCurrentRank: true,
    showTargetRank: false,
    showServiceDetail: true,
    currentRankLabel: "Current rank (optional)",
    targetRankLabel: "Target rank",
    serviceDetailLabel: "Badge / achievement",
    requireCurrentRank: false,
    requireTargetRank: false,
    requireServiceDetail: true,
  },
  predator_maintenance: {
    showCurrentRank: true,
    showTargetRank: false,
    showServiceDetail: true,
    currentRankLabel: "Current rank / RP band",
    targetRankLabel: "Target rank",
    serviceDetailLabel: "Maintenance plan",
    requireCurrentRank: true,
    requireTargetRank: false,
    requireServiceDetail: true,
  },
  unban_service: {
    showCurrentRank: false,
    showTargetRank: false,
    showServiceDetail: false,
    currentRankLabel: "Current rank",
    targetRankLabel: "Target rank",
    serviceDetailLabel: "",
    requireCurrentRank: false,
    requireTargetRank: false,
    requireServiceDetail: false,
  },
  marketplace: {
    showCurrentRank: false,
    showTargetRank: false,
    showServiceDetail: false,
    currentRankLabel: "Current rank",
    targetRankLabel: "Target rank",
    serviceDetailLabel: "",
    requireCurrentRank: false,
    requireTargetRank: false,
    requireServiceDetail: false,
  },
};
