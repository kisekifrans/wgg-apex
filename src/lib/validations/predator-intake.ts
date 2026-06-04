import { z } from "zod";

export const predatorIntakeSchema = z.object({
  customerDiscord: z.string().trim().min(2, "Discord username is required"),
  currentRank: z.string().trim().min(2, "Current rank or RP band is required"),
  nintendoBackupCode: z
    .string()
    .trim()
    .min(4, "Nintendo backup login code is required"),
  eaEmail: z.string().trim().email("Valid EA email is required"),
  eaPassword: z.string().trim().min(4, "EA password is required"),
  eaBackupCode: z.string().trim().min(4, "EA backup code is required"),
});
