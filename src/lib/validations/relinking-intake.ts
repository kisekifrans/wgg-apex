import { z } from "zod";

export const relinkingIntakeSchema = z.object({
  customerDiscord: z.string().trim().min(2, "Discord username is required"),
  platform: z.enum(["psn", "xbox", "steam"], {
    error: "Select which platform link to remove",
  }),
  eaAccount: z.string().trim().min(2, "EA account is required"),
  eaEmail: z.string().trim().email("Enter a valid EA email"),
  eaPassword: z.string().trim().min(4, "EA password is required"),
  eaBackupCode: z.string().trim().min(4, "EA backup code is required"),
});
