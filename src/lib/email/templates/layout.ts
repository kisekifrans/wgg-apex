import type { EmailBrandUrls } from "@/lib/email/templates/brand";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

type EmailLayoutOptions = {
  brand: EmailBrandUrls;
  eyebrow: string;
  title: string;
  intro: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerNote?: string;
};

export function wrapBrandedEmail({
  brand,
  eyebrow,
  title,
  intro,
  bodyHtml,
  cta,
  footerNote,
}: EmailLayoutOptions): string {
  const ctaBlock = cta
    ? `<tr>
        <td style="padding:8px 32px 32px;">
          <a href="${escapeHtml(cta.href)}" style="display:inline-block;background:#f97316;color:#0a0a0a;text-decoration:none;font-weight:600;font-size:14px;padding:14px 24px;border-radius:10px;box-shadow:0 1px 0 rgba(255,255,255,0.08) inset;">${escapeHtml(cta.label)}</a>
        </td>
      </tr>`
    : "";

  const footer = footerNote
    ? `<p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#71717a;">${footerNote}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#050505;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#fafafa;-webkit-font-smoothing:antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:linear-gradient(180deg,#050505 0%,#0a0a0a 100%);padding:40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">
            <tr>
              <td align="center" style="padding:0 0 20px;">
                <a href="${escapeHtml(brand.siteUrl)}" style="text-decoration:none;">
                  <img src="${escapeHtml(brand.logoUrl)}" width="132" height="auto" alt="WGG Apex" style="display:block;border:0;outline:none;height:auto;max-width:132px;" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background:#111111;box-shadow:0 24px 48px rgba(0,0,0,0.35);">
                <img src="${escapeHtml(brand.heroUrl)}" width="560" alt="" style="display:block;width:100%;max-width:560px;height:auto;border:0;outline:none;" />
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:28px 32px 8px;">
                      <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#facc15;">${escapeHtml(eyebrow)}</p>
                      <h1 style="margin:10px 0 0;font-size:26px;font-weight:700;line-height:1.25;letter-spacing:-0.02em;color:#fafafa;">${escapeHtml(title)}</h1>
                      <p style="margin:14px 0 0;font-size:15px;line-height:1.65;color:#a1a1aa;">${escapeHtml(intro)}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 32px 8px;">
                      ${bodyHtml}
                    </td>
                  </tr>
                  ${ctaBlock}
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 16px 8px;">
                <a href="${escapeHtml(brand.siteUrl)}" style="text-decoration:none;">
                  <img src="${escapeHtml(brand.logoUrl)}" width="72" height="auto" alt="WGG Apex" style="display:block;border:0;outline:none;opacity:0.85;height:auto;max-width:72px;margin:0 auto;" />
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 16px 24px;">
                ${footer}
                <p style="margin:0;font-size:11px;line-height:1.6;color:#52525b;">
                  <a href="${escapeHtml(brand.siteUrl)}" style="color:#a1a1aa;text-decoration:none;">wggapex.com</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function emailDetailsTable(rows: { label: string; value: string; mono?: boolean }[]): string {
  const rowHtml = rows
    .map(
      (row) => `<tr>
        <td style="padding:10px 0;color:#71717a;font-size:13px;vertical-align:top;width:38%;">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;color:${row.mono ? "#f97316" : "#fafafa"};font-size:14px;text-align:right;vertical-align:top;${row.mono ? "font-family:ui-monospace,SFMono-Regular,Menlo,monospace;" : ""}">${escapeHtml(row.value)}</td>
      </tr>`
    )
    .join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);margin:8px 0;">
    ${rowHtml}
  </table>`;
}

export function emailProgressBar(percent: number): string {
  const safe = Math.max(0, Math.min(100, percent));
  return `<div style="margin-top:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td style="font-size:12px;color:#71717a;padding-bottom:8px;">Progress</td>
        <td align="right" style="font-size:12px;color:#fafafa;font-family:ui-monospace,monospace;padding-bottom:8px;">${safe}%</td>
      </tr>
    </table>
    <div style="height:8px;border-radius:999px;background:rgba(255,255,255,0.06);overflow:hidden;">
      <div style="height:8px;width:${safe}%;background:linear-gradient(90deg,#f97316,#fb923c);border-radius:999px;"></div>
    </div>
  </div>`;
}
