import type { ServiceOrderType } from "@/types/orders";
import type { UnbanIntakeDetails } from "@/types/unban";

export type CheckoutKind = ServiceOrderType;

export type CheckoutQuote = {
  amountCents: number;
  currency: string;
  lineItemName: string;
  lineItemDescription?: string;
  serviceSlug: string;
  checkoutKind: CheckoutKind;
  pricingItemId: string | null;
  marketplaceListingId: string | null;
  serviceDetail: string | null;
};

export type CheckoutFormInput = {
  customerDiscord: string;
  customerEmail?: string | null;
  currentRank?: string | null;
  targetRank?: string | null;
  notes?: string | null;
  pricingItemId?: string | null;
  listingId?: string | null;
  unbanDetails?: UnbanIntakeDetails | null;
};
