import { z } from "zod";

const relinkingPlatformSchema = z.enum(["psn", "xbox", "steam"], {
  error: "Select which platform link to remove",
});

export const relinkingIntakeSchema = z
  .object({
    customerDiscord: z.string().trim().min(2, "Discord username is required"),
    platform: relinkingPlatformSchema,
    eaAccount: z.string().trim().min(2, "EA account is required"),
    eaEmail: z.string().trim().email("Enter a valid EA email"),
    eaPassword: z.string().trim().min(4, "EA password is required"),
    eaBackupCode: z.string().trim().min(4, "EA backup code is required"),
    steamId: z.string().optional(),
    steamPassword: z.string().optional(),
    xboxEmail: z.string().optional(),
    xboxPassword: z.string().optional(),
    psnEmail: z.string().optional(),
    psnPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.platform === "steam") {
      if (!data.steamId?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Steam ID is required",
          path: ["steamId"],
        });
      }
      if (!data.steamPassword?.trim() || data.steamPassword.trim().length < 4) {
        ctx.addIssue({
          code: "custom",
          message: "Steam password is required",
          path: ["steamPassword"],
        });
      }
    }

    if (data.platform === "xbox") {
      const email = data.xboxEmail?.trim() ?? "";
      if (!email || !z.string().email().safeParse(email).success) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid Xbox email",
          path: ["xboxEmail"],
        });
      }
      if (!data.xboxPassword?.trim() || data.xboxPassword.trim().length < 4) {
        ctx.addIssue({
          code: "custom",
          message: "Xbox password is required",
          path: ["xboxPassword"],
        });
      }
    }

    if (data.platform === "psn") {
      const email = data.psnEmail?.trim() ?? "";
      if (!email || !z.string().email().safeParse(email).success) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid PSN email",
          path: ["psnEmail"],
        });
      }
      if (!data.psnPassword?.trim() || data.psnPassword.trim().length < 4) {
        ctx.addIssue({
          code: "custom",
          message: "PSN password is required",
          path: ["psnPassword"],
        });
      }
    }
  });
