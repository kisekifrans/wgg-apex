import { getEmailBrandUrls } from "@/lib/email/templates/brand";
import {
  emailDetailsTable,
  emailProgressBar,
  escapeHtml,
  wrapBrandedEmail,
} from "@/lib/email/templates/layout";

export type OrderStatusUpdateEmailData = {
  orderNumber: string;
  serviceName: string;
  serviceLabel: string;
  statusLabel: string;
  progressPercent: number;
  message: string;
  trackOrderUrl: string;
  siteName: string;
  supportEmail: string;
};

export function buildOrderStatusUpdateSubject(
  data: OrderStatusUpdateEmailData
): string {
  return `Order update — ${data.orderNumber} is now ${data.statusLabel}`;
}

export function buildOrderStatusUpdateText(
  data: OrderStatusUpdateEmailData
): string {
  return [
    `Your ${data.siteName} order has been updated.`,
    "",
    `Order: ${data.orderNumber}`,
    `Service: ${data.serviceName}`,
    `Status: ${data.statusLabel}`,
    `Progress: ${data.progressPercent}%`,
    "",
    data.message,
    "",
    `Track your order: ${data.trackOrderUrl}`,
    "",
    `Questions? ${data.supportEmail}`,
  ].join("\n");
}

export function buildOrderStatusUpdateHtml(
  data: OrderStatusUpdateEmailData
): string {
  const brand = getEmailBrandUrls();

  const bodyHtml = `${emailDetailsTable([
    { label: "Order", value: data.orderNumber, mono: true },
    { label: "Service", value: data.serviceName },
    { label: "Status", value: data.statusLabel },
  ])}
  ${emailProgressBar(data.progressPercent)}
  <p style="margin:18px 0 0;font-size:14px;line-height:1.65;color:#d4d4d8;">${escapeHtml(data.message)}</p>`;

  return wrapBrandedEmail({
    brand,
    eyebrow: "Order update",
    title: `Now ${data.statusLabel}`,
    intro: `Your ${data.serviceLabel} order has a new status.`,
    bodyHtml,
    cta: { label: "Track your order", href: data.trackOrderUrl },
    footerNote: `Questions? <a href="mailto:${escapeHtml(data.supportEmail)}" style="color:#f97316;text-decoration:none;">${escapeHtml(data.supportEmail)}</a>`,
  });
}
