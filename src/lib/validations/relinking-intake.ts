import { z } from "zod";

export const relinkingIntakeSchema = z.object({
  customerDiscord: z.string().trim().min(2, "Discord username is required"),
  platform: z.enum(["ea", "psn", "xbox", "steam"], {
    error: "Select a platform",
  }),
  accountId: z.string().trim().min(2, "Account ID is required"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().trim().min(4, "Password is required"),
  backupCode: z.string().trim().min(4, "Backup code is required"),
});
