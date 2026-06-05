import "server-only";

import { getPayPalEnv } from "@/lib/paypal/env";

type TokenCache = {
  token: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  const { clientId, clientSecret, apiBase, isConfigured } = getPayPalEnv();

  if (!isConfigured) {
    throw new Error("PayPal is not configured");
  }

  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal auth failed: ${text.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

export async function paypalApi<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const { apiBase } = getPayPalEnv();
  const token = await getPayPalAccessToken();

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const body = text ? (JSON.parse(text) as T) : ({} as T);

  if (!response.ok) {
    throw new Error(
      `PayPal API ${path} failed (${response.status}): ${text.slice(0, 300)}`
    );
  }

  return body;
}
