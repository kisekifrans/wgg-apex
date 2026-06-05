import { getOrderTypeLabel } from "@/lib/orders/public-display";
import { getEmailBrandUrls } from "@/lib/email/templates/brand";
import {
  emailDetailsTable,
  escapeHtml,
  wrapBrandedEmail,
} from "@/lib/email/templates/layout";
import type { ServiceOrderType } from "@/types/orders";

export type OrderConfirmationEmailData = {
  orderNumber: string;
  orderType: ServiceOrderType;
  serviceName: string;
  customerDiscord: string;
  currentRank: string | null;
  targetRank: string | null;
  serviceDetail: string | null;
  amountCents: number;
  currency: string;
  trackOrderUrl: string;
  accountUrl: string;
  siteName: string;
  supportEmail: string;
};

function formatMoney(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function rankLine(data: OrderConfirmationEmailData): string | null {
  if (data.currentRank && data.targetRank) {
    return `${data.currentRank} → ${data.targetRank}`;
  }
  return data.serviceDetail;
}

export function buildOrderConfirmationSubject(
  data: OrderConfirmationEmailData
): string {
  return `Order confirmed — ${data.orderNumber} · ${data.serviceName}`;
}

export function buildOrderConfirmationText(
  data: OrderConfirmationEmailData
): string {
  const serviceLabel = getOrderTypeLabel(data.orderType);
  const span = rankLine(data);
  const amount = formatMoney(data.amountCents, data.currency);

  return [
    `Thanks for your order with ${data.siteName}.`,
    "",
    `Order number: ${data.orderNumber}`,
    `Service: ${data.serviceName} (${serviceLabel})`,
    span ? `Details: ${span}` : null,
    `Amount paid: ${amount}`,
    `Discord: ${data.customerDiscord}`,
    "",
    "Our operators will reach out on Discord to start fulfillment.",
    "",
    `Track your order: ${data.trackOrderUrl}`,
    `View all orders: ${data.accountUrl}`,
    "",
    `Questions? ${data.supportEmail}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOrderConfirmationHtml(
  data: OrderConfirmationEmailData
): string {
  const brand = getEmailBrandUrls();
  const serviceLabel = getOrderTypeLabel(data.orderType);
  const span = rankLine(data);
  const amount = formatMoney(data.amountCents, data.currency);

  const rows = [
    { label: "Order", value: data.orderNumber, mono: true },
    { label: "Service", value: data.serviceName },
    { label: "Type", value: serviceLabel },
    ...(span ? [{ label: "Details", value: span }] : []),
    { label: "Paid", value: amount, mono: true },
    { label: "Discord", value: data.customerDiscord },
  ];

  const bodyHtml = `${emailDetailsTable(rows)}
    <p style="margin:20px 0 0;font-size:13px;line-height:1.65;color:#71717a;">
      Operators will contact you on Discord to begin. You can also
      <a href="${escapeHtml(data.accountUrl)}" style="color:#f97316;text-decoration:none;font-weight:500;">sign in to My Orders</a>
      with this email anytime.
    </p>`;

  return wrapBrandedEmail({
    brand,
    eyebrow: data.siteName,
    title: "Payment received",
    intro:
      "Your order is confirmed and queued for fulfillment. Save this email for your records.",
    bodyHtml,
    cta: { label: "Track your order", href: data.trackOrderUrl },
    footerNote: `Need help? <a href="mailto:${escapeHtml(data.supportEmail)}" style="color:#f97316;text-decoration:none;">${escapeHtml(data.supportEmail)}</a>`,
  });
}

export function buildOpsOrderNotificationText(
  data: OrderConfirmationEmailData,
  customerEmail: string
): string {
  const amount = formatMoney(data.amountCents, data.currency);
  const span = rankLine(data);
  return [
    `New paid order: ${data.orderNumber}`,
    `Service: ${data.serviceName}`,
    span ? `Details: ${span}` : null,
    `Amount: ${amount}`,
    `Discord: ${data.customerDiscord}`,
    `Email: ${customerEmail}`,
  ]
    .filter(Boolean)
    .join("\n");
}
