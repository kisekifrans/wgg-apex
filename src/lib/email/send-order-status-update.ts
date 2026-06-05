import "server-only";

import { getResendClient } from "@/lib/email/client";
import { getEmailEnv } from "@/lib/email/env";
import {
  buildOrderStatusUpdateHtml,
  buildOrderStatusUpdateSubject,
  buildOrderStatusUpdateText,
} from "@/lib/email/templates/order-status-update";
import { getOrderTypeLabel } from "@/lib/orders/public-display";
import { getSiteUrl } from "@/lib/site-url";
import { siteConfig } from "@/config/site";
import type { ServiceOrderStatus, ServiceOrderType } from "@/types/orders";

export type SendOrderStatusUpdateInput = {
  orderNumber: string;
  orderType: ServiceOrderType;
  serviceName: string;
  customerEmail: string;
  previousStatus: ServiceOrderStatus;
  newStatus: ServiceOrderStatus;
  statusLabel: string;
  progressPercent: number;
  message: string;
};

export async function sendOrderStatusUpdateEmail(
  input: SendOrderStatusUpdateInput
): Promise<void> {
  const client = getResendClient();
  const { from, replyTo, isConfigured } = getEmailEnv();

  if (!isConfigured || !client) {
    console.warn(
      "[email] Skipping status update — RESEND_API_KEY or EMAIL_FROM not configured"
    );
    return;
  }

  const email = input.customerEmail.trim().toLowerCase();
  if (!email) return;

  if (input.previousStatus === input.newStatus) return;

  const siteUrl = getSiteUrl();
  const payload = {
    orderNumber: input.orderNumber,
    serviceName: input.serviceName,
    serviceLabel: getOrderTypeLabel(input.orderType),
    statusLabel: input.statusLabel,
    progressPercent: input.progressPercent,
    message: input.message,
    trackOrderUrl: `${siteUrl}/track-order?order=${encodeURIComponent(input.orderNumber)}`,
    siteName: siteConfig.name,
    supportEmail: siteConfig.supportEmail,
  };

  try {
    const { error } = await client.emails.send({
      from,
      to: email,
      replyTo,
      subject: buildOrderStatusUpdateSubject(payload),
      text: buildOrderStatusUpdateText(payload),
      html: buildOrderStatusUpdateHtml(payload),
    });

    if (error) {
      console.error("[email] Status update failed:", error);
    }
  } catch (err) {
    console.error("[email] Status update error:", err);
  }
}
