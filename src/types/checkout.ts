import type { ServiceOrderType } from "@/types/orders";
import type { PredatorIntakeDetails } from "@/types/predator";
import type { RelinkingIntakeDetails } from "@/types/relinking";
import type { UnbanIntakeDetails } from "@/types/unban";

export type CheckoutKind = ServiceOrderType;

export type CheckoutQuoteAdjustment = {
  label: string;
  cents: number;
};

export type CheckoutQuote = {
  /** Total charged (service + processing fee). */
  amountCents: number;
  /** Service subtotal before processing fee. */
  serviceCents: number;
  processingFeeCents: number;
  discountCents?: number;
  promoCode?: string | null;
  promoCodeId?: string | null;
  currency: string;
  lineItemName: string;
  lineItemDescription?: string;
  serviceSlug: string;
  checkoutKind: CheckoutKind;
  pricingItemId: string | null;
  marketplaceListingId: string | null;
  serviceDetail: string | null;
  adjustments?: CheckoutQuoteAdjustment[];
};

export type CheckoutFormInput = {
  customerDiscord: string;
  customerEmail?: string | null;
  currentRank?: string | null;
  targetRank?: string | null;
  notes?: string | null;
  pricingItemId?: string | null;
  listingId?: string | null;
  platform?: string | null;
  priority?: string | null;
  killCount?: number | null;
  unbanDetails?: UnbanIntakeDetails | null;
  predatorDetails?: PredatorIntakeDetails | null;
  relinkingDetails?: RelinkingIntakeDetails | null;
  promoCode?: string | null;
};
