"use server";

import { buildCheckoutQuote } from "@/lib/checkout/quote";
import type { CheckoutFormInput, CheckoutQuote } from "@/types/checkout";

export type GetCheckoutQuoteResult =
  | { success: true; quote: CheckoutQuote }
  | { success: false; error: string };

export async function getCheckoutQuote(
  serviceSlug: string | null,
  input: CheckoutFormInput
): Promise<GetCheckoutQuoteResult> {
  return buildCheckoutQuote(serviceSlug, input);
}
