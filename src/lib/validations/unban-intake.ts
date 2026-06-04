import { z } from "zod";

export const unbanIntakeSchema = z.object({
  customerDiscord: z
    .string()
    .min(2, "Discord username is required")
    .max(120),
  eaLoginId: z
    .string()
    .min(2, "EA Login ID is required")
    .max(120),
  eaEmail: z.string().email("Valid EA account email is required").max(255),
  banDate: z.string().min(1, "Ban date is required"),
  previousAppeals: z
    .string()
    .min(1, "Please describe previous appeals")
    .max(2000),
  additionalNotes: z.string().max(5000).optional().nullable(),
});

export type UnbanIntakeInput = z.infer<typeof unbanIntakeSchema>;
