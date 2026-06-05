import { getOrderTypeLabel } from "@/lib/orders/public-display";
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
    "",
    `Questions? ${data.supportEmail}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildOrderConfirmationHtml(
  data: OrderConfirmationEmailData
): string {
  const serviceLabel = getOrderTypeLabel(data.orderType);
  const span = rankLine(data);
  const amount = formatMoney(data.amountCents, data.currency);

  const detailRow = span
    ? `<tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Details</td><td style="padding:8px 0;color:#fafafa;font-size:14px;text-align:right;">${escapeHtml(span)}</td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,Segoe UI,sans-serif;color:#fafafa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width:520px;background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 12px;">
                <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#facc15;">${escapeHtml(data.siteName)}</p>
                <h1 style="margin:12px 0 0;font-size:24px;font-weight:600;">Payment received</h1>
                <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#a1a1aa;">Your order is confirmed. We'll contact you on Discord to begin.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.06);">
                  <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Order</td><td style="padding:8px 0;color:#f97316;font-size:14px;font-family:ui-monospace,monospace;text-align:right;">${escapeHtml(data.orderNumber)}</td></tr>
                  <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Service</td><td style="padding:8px 0;color:#fafafa;font-size:14px;text-align:right;">${escapeHtml(data.serviceName)}</td></tr>
                  <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Type</td><td style="padding:8px 0;color:#fafafa;font-size:14px;text-align:right;">${escapeHtml(serviceLabel)}</td></tr>
                  ${detailRow}
                  <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Paid</td><td style="padding:8px 0;color:#fafafa;font-size:14px;font-family:ui-monospace,monospace;text-align:right;">${escapeHtml(amount)}</td></tr>
                  <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Discord</td><td style="padding:8px 0;color:#fafafa;font-size:14px;text-align:right;">${escapeHtml(data.customerDiscord)}</td></tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <a href="${escapeHtml(data.trackOrderUrl)}" style="display:inline-block;background:#f97316;color:#0a0a0a;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:10px;">Track your order</a>
                <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#71717a;">Need help? Reply to this email or contact <a href="mailto:${escapeHtml(data.supportEmail)}" style="color:#f97316;">${escapeHtml(data.supportEmail)}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
