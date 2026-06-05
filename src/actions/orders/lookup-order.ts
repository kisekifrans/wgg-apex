"use server";

import { headers } from "next/headers";
import { z } from "zod";

import {
  lookupPublicOrder,
  lookupPublicOrderByDiscord,
} from "@/lib/db/public-orders";
import { getClientIp } from "@/lib/security/client-ip";
import { checkRateLimit } from "@/lib/security/rate-limit";
import type { PublicOrderSnapshot } from "@/types/public-order";

const orderNumberSchema = z
  .string()
  .min(4, "Enter your order number")
  .max(32, "Order number is too long");

const emailLookupSchema = z.object({
  method: z.literal("email"),
  orderNumber: orderNumberSchema,
  email: z.string().email("Enter a valid email address"),
});

const discordLookupSchema = z.object({
  method: z.literal("discord"),
  orderNumber: orderNumberSchema,
  discord: z
    .string()
    .min(2, "Enter your Discord username")
    .max(64, "Discord username is too long"),
});

const lookupSchema = z.discriminatedUnion("method", [
  emailLookupSchema,
  discordLookupSchema,
]);

export type LookupOrderInput = z.infer<typeof lookupSchema>;

export type LookupOrderResult =
  | { success: true; order: PublicOrderSnapshot }
  | { success: false; error: string };

export async function lookupOrder(
  input: LookupOrderInput
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

  const order =
    parsed.data.method === "email"
      ? await lookupPublicOrder(parsed.data.orderNumber, parsed.data.email)
      : await lookupPublicOrderByDiscord(
          parsed.data.orderNumber,
          parsed.data.discord
        );

  if (!order) {
    return {
      success: false,
      error:
        parsed.data.method === "email"
          ? "No order found for that combination. Check your order number and the email used at checkout."
          : "No order found for that combination. Check your order number and the Discord username used at checkout.",
    };
  }

  return { success: true, order };
}
