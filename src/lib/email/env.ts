import "server-only";

export function getEmailEnv() {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM?.trim() || "WGG Apex <orders@wggapex.com>";
  const replyTo = process.env.EMAIL_REPLY_TO?.trim() || "support@wggapex.com";
  const opsNotify = process.env.EMAIL_OPS_NOTIFY?.trim() || null;

  return {
    apiKey,
    from,
    replyTo,
    opsNotify,
    isConfigured: Boolean(apiKey && from),
  };
}
