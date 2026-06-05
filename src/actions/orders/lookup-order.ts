"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { lookupPublicOrder } from "@/lib/db/public-orders";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { PublicOrderSnapshot } from "@/types/public-order";

const lookupSchema = z.object({
  orderNumber: z
    .string()
    .min(4, "Enter your order number")
    .max(32, "Order number is too long"),
  email: z.string().email("Enter a valid email address"),
});

export type LookupOrderResult =
  | { success: true; order: PublicOrderSnapshot }
  | { success: false; error: string };

export async function lookupOrder(
  input: z.infer<typeof lookupSchema>
): Promise<LookupOrderResult> {
  const headersList = await headers();
  const ip = getClientIp(headersList);
  const rateLimit = checkRateLimit(`order-lookup:${ip}`, {
    limit: 15,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Too many lookups. Try again in ${rateLimit.retryAfterSec} seconds.`,
    };
  }

  const parsed = lookupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const order = await lookupPublicOrder(
    parsed.data.orderNumber,
    parsed.data.email
  );

  if (!order) {
    return {
      success: false,
      error:
        "No order found for that combination. Check your order number and the email used at checkout.",
    };
  }

  return { success: true, order };
}
