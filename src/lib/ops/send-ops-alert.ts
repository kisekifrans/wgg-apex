import "server-only";

import { getResendClient } from "@/lib/email/client";
import { getEmailEnv } from "@/lib/email/env";
import { siteConfig } from "@/config/site";

export async function sendOpsAlert(
  subject: string,
  body: string
): Promise<void> {
  const client = getResendClient();
  const { from, opsNotify, isConfigured } = getEmailEnv();

  if (!isConfigured || !client || !opsNotify) return;

  try {
    const { error } = await client.emails.send({
      from,
      to: opsNotify,
      subject: `[${siteConfig.name}] ${subject}`,
      text: body,
    });

    if (error) {
      console.error("[ops-alert] Failed to send:", error);
    }
  } catch (err) {
    console.error("[ops-alert] Error:", err);
  }
}
