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
  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0a0a0a;font-family:Inter,Segoe UI,sans-serif;color:#fafafa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width:520px;background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
            <tr>
              <td style="padding:28px;">
                <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#facc15;">${escapeHtml(data.siteName)}</p>
                <h1 style="margin:12px 0 0;font-size:22px;">Order status updated</h1>
                <p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#a1a1aa;">${escapeHtml(data.message)}</p>
                <table width="100%" style="margin-top:20px;border-top:1px solid rgba(255,255,255,0.06);">
                  <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Order</td><td style="padding:8px 0;color:#f97316;font-family:monospace;text-align:right;">${escapeHtml(data.orderNumber)}</td></tr>
                  <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Status</td><td style="padding:8px 0;text-align:right;">${escapeHtml(data.statusLabel)}</td></tr>
                  <tr><td style="padding:8px 0;color:#a1a1aa;font-size:13px;">Progress</td><td style="padding:8px 0;text-align:right;">${data.progressPercent}%</td></tr>
                </table>
                <a href="${escapeHtml(data.trackOrderUrl)}" style="display:inline-block;margin-top:24px;background:#f97316;color:#0a0a0a;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px;">Track your order</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
