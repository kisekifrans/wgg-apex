"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/guards";
import { setAppSetting } from "@/lib/db/app-settings";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export async function saveDiscordWebhooks(
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const soldWebhookUrl = String(formData.get("soldWebhookUrl") ?? "").trim();
  const ordersWebhookUrl = String(formData.get("ordersWebhookUrl") ?? "").trim();

  for (const url of [soldWebhookUrl, ordersWebhookUrl]) {
    if (url && !url.startsWith("https://discord.com/api/webhooks/")) {
      return { success: false, error: "Invalid Discord webhook URL" };
    }
  }

  try {
    await setAppSetting("discord_webhooks", {
      soldWebhookUrl,
      ordersWebhookUrl,
    });
    revalidatePath("/admin/content");
    revalidatePath("/admin/discord");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to save",
    };
  }
}

/** @deprecated Use saveDiscordWebhooks */
export async function saveSoldWebhookUrl(
  formData: FormData
): Promise<ActionResult> {
  return saveDiscordWebhooks(formData);
}
