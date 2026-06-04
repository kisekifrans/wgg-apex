import { z } from "zod";

import { ORDER_TYPE_FIELDS } from "@/config/orders";
import {
  SERVICE_ORDER_PAYMENT_STATUSES,
  SERVICE_ORDER_STATUSES,
  SERVICE_ORDER_TYPES,
} from "@/types/orders";

export const serviceOrderSchema = z
  .object({
    orderType: z.enum(SERVICE_ORDER_TYPES),
    customerDiscord: z
      .string()
      .min(2, "Discord handle is required")
      .max(120, "Discord handle is too long"),
    currentRank: z.string().max(80).optional().nullable(),
    targetRank: z.string().max(80).optional().nullable(),
    serviceDetail: z.string().max(200).optional().nullable(),
    notes: z.string().max(5000).optional().nullable(),
    status: z.enum(SERVICE_ORDER_STATUSES),
    paymentStatus: z.enum(SERVICE_ORDER_PAYMENT_STATUSES),
    amountDollars: z
      .union([z.literal(""), z.coerce.number().nonnegative()])
      .optional()
      .nullable(),
    customerEmail: z.string().max(255).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const email = data.customerEmail?.trim();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid email",
        path: ["customerEmail"],
      });
    }

    const fields = ORDER_TYPE_FIELDS[data.orderType];

    if (fields.requireCurrentRank && !data.currentRank?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Current rank is required for this order type",
        path: ["currentRank"],
      });
    }

    if (fields.requireTargetRank && !data.targetRank?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Target rank is required for this order type",
        path: ["targetRank"],
      });
    }

    if (fields.requireServiceDetail && !data.serviceDetail?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: `${fields.serviceDetailLabel} is required`,
        path: ["serviceDetail"],
      });
    }
  });

export type ServiceOrderInput = z.infer<typeof serviceOrderSchema>;

export function parseAmountDollars(
  value: string | number | null | undefined
): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return null;
  return n;
}
