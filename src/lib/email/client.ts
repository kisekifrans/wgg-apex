import "server-only";

import { Resend } from "resend";

import { getEmailEnv } from "@/lib/email/env";

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const { apiKey, isConfigured } = getEmailEnv();
  if (!isConfigured || !apiKey) return null;

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}
