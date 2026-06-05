import "server-only";

import { getResendClient } from "@/lib/email/client";
import { getEmailEnv } from "@/lib/email/env";
import {
  buildOpsOrderNotificationText,
  buildOrderConfirmationHtml,
  buildOrderConfirmationSubject,
  buildOrderConfirmationText,
  type OrderConfirmationEmailData,
} from "@/lib/email/templates/order-confirmation";
import { getSiteUrl } from "@/lib/site-url";
import { siteConfig } from "@/config/site";
import type { ServiceOrderType } from "@/types/orders";

export type SendOrderConfirmationInput = {
  orderNumber: string;
  orderType: ServiceOrderType;
  serviceName: string;
  customerEmail: string;
  customerDiscord: string;
  currentRank: string | null;
  targetRank: string | null;
  serviceDetail: string | null;
  amountCents: number;
  currency: string;
};

/** Sends customer confirmation (+ optional ops alert). Never throws — logs on failure. */
export async function sendOrderConfirmationEmail(
  input: SendOrderConfirmationInput
): Promise<void> {
  const client = getResendClient();
  const { from, replyTo, opsNotify, isConfigured } = getEmailEnv();

  if (!isConfigured || !client) {
    console.warn(
      "[email] Skipping order confirmation — RESEND_API_KEY or EMAIL_FROM not configured"
    );
    return;
  }

  const email = input.customerEmail.trim().toLowerCase();
  if (!email) return;

  const siteUrl = getSiteUrl();
  const data: OrderConfirmationEmailData = {
    orderNumber: input.orderNumber,
    orderType: input.orderType,
    serviceName: input.serviceName,
    customerDiscord: input.customerDiscord,
    currentRank: input.currentRank,
    targetRank: input.targetRank,
    serviceDetail: input.serviceDetail,
    amountCents: input.amountCents,
    currency: input.currency,
    trackOrderUrl: `${siteUrl}/track-order?order=${encodeURIComponent(input.orderNumber)}`,
    accountUrl: `${siteUrl}/account/login`,
    siteName: siteConfig.name,
    supportEmail: siteConfig.supportEmail,
  };

  const subject = buildOrderConfirmationSubject(data);

  try {
    const { error } = await client.emails.send({
      from,
      to: email,
      replyTo,
      subject,
      text: buildOrderConfirmationText(data),
      html: buildOrderConfirmationHtml(data),
    });

    if (error) {
      console.error("[email] Order confirmation failed:", error);
    }
  } catch (err) {
    console.error("[email] Order confirmation error:", err);
  }

  if (!opsNotify) return;

  try {
    const { error } = await client.emails.send({
      from,
      to: opsNotify,
      replyTo,
      subject: `[New order] ${input.orderNumber} · ${input.serviceName}`,
      text: buildOpsOrderNotificationText(data, email),
    });

    if (error) {
      console.error("[email] Ops notification failed:", error);
    }
  } catch (err) {
    console.error("[email] Ops notification error:", err);
  }
}
