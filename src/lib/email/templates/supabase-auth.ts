import { brandAssets } from "@/config/brand-assets";

/** Supabase Auth uses Go templates — paste output into Dashboard → Authentication → Email Templates. */
const SITE = "{{ .SiteURL }}";

type SupabaseAuthEmailVariant = "magic_link" | "confirm_signup";

function supabaseAuthEmailHtml(
  variant: SupabaseAuthEmailVariant
): string {
  const copy =
    variant === "magic_link"
      ? {
          eyebrow: "Sign in",
          title: "Your WGG Apex sign-in link",
          intro:
            "Tap the button below to sign in to your account and track orders. This link expires soon and can only be used once.",
          cta: "Sign in to WGG Apex",
          footer:
            "If you did not request this email, you can ignore it. For help, reply to support@wggapex.com.",
        }
      : {
          eyebrow: "Welcome",
          title: "Confirm your WGG Apex account",
          intro:
            "Finish setting up your account so you can track boosts and order history. One click and you are in.",
          cta: "Confirm email address",
          footer:
            "If you did not create an account on wggapex.com, you can ignore this email.",
        };

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${copy.title}</title>
  </head>
  <body style="margin:0;padding:0;background:#050505;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#fafafa;-webkit-font-smoothing:antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:linear-gradient(180deg,#050505 0%,#0a0a0a 100%);padding:40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;">
            <tr>
              <td align="center" style="padding:0 0 20px;">
                <a href="${SITE}" style="text-decoration:none;">
                  <img src="${SITE}${brandAssets.logo}" width="132" height="auto" alt="WGG Apex" style="display:block;border:0;outline:none;height:auto;max-width:132px;" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);background:#111111;box-shadow:0 24px 48px rgba(0,0,0,0.35);">
                <img src="${SITE}${brandAssets.brandHero}" width="560" alt="" style="display:block;width:100%;max-width:560px;height:auto;border:0;outline:none;" />
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="padding:28px 32px 8px;">
                      <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#facc15;">${copy.eyebrow}</p>
                      <h1 style="margin:10px 0 0;font-size:26px;font-weight:700;line-height:1.25;letter-spacing:-0.02em;color:#fafafa;">${copy.title}</h1>
                      <p style="margin:14px 0 0;font-size:15px;line-height:1.65;color:#a1a1aa;">${copy.intro}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 32px 8px;">
                      <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;">Use the same email you used at checkout so your orders appear in your account.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 32px 32px;">
                      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f97316;color:#0a0a0a;text-decoration:none;font-weight:600;font-size:14px;padding:14px 24px;border-radius:10px;box-shadow:0 1px 0 rgba(255,255,255,0.08) inset;">${copy.cta}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 16px 8px;">
                <a href="${SITE}" style="text-decoration:none;">
                  <img src="${SITE}${brandAssets.logo}" width="72" height="auto" alt="WGG Apex" style="display:block;border:0;outline:none;opacity:0.85;height:auto;max-width:72px;margin:0 auto;" />
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:0 16px 24px;">
                <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:#71717a;">${copy.footer}</p>
                <p style="margin:0;font-size:11px;line-height:1.6;color:#52525b;">
                  <a href="${SITE}" style="color:#a1a1aa;text-decoration:none;">wggapex.com</a>
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

export const SUPABASE_MAGIC_LINK_EMAIL_SUBJECT = "Sign in to WGG Apex";
export const SUPABASE_CONFIRM_SIGNUP_EMAIL_SUBJECT =
  "Confirm your WGG Apex account";

export const supabaseMagicLinkEmailHtml = supabaseAuthEmailHtml("magic_link");
export const supabaseConfirmSignupEmailHtml =
  supabaseAuthEmailHtml("confirm_signup");
