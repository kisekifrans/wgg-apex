import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const ENCRYPTED_PREFIX = "enc:v1:";

const SENSITIVE_PREDATOR_KEYS = [
  "nintendoPassword",
  "nintendoBackupCode",
  "eaPassword",
  "eaBackupCode",
] as const;

const SENSITIVE_RELINKING_KEYS = [
  "eaPassword",
  "eaBackupCode",
  "steamPassword",
  "xboxPassword",
  "psnPassword",
  "password",
  "backupCode",
] as const;

function getEncryptionKey(): Buffer | null {
  const raw = process.env.CHECKOUT_PAYLOAD_ENCRYPTION_KEY?.trim();
  if (!raw) {
    return null;
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error(
      "CHECKOUT_PAYLOAD_ENCRYPTION_KEY must be 32 bytes (base64-encoded)"
    );
  }

  return key;
}

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CHECKOUT_PAYLOAD_ENCRYPTION_KEY is required in production");
    }
    return plaintext;
  }
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${ENCRYPTED_PREFIX}${Buffer.concat([iv, tag, encrypted]).toString("base64")}`;
}

export function decryptSecret(value: string): string {
  if (!value.startsWith(ENCRYPTED_PREFIX)) {
    return value;
  }

  const key = getEncryptionKey();
  if (!key) {
    return value;
  }
  const payload = Buffer.from(value.slice(ENCRYPTED_PREFIX.length), "base64");
  const iv = payload.subarray(0, IV_LENGTH);
  const tag = payload.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = payload.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8"
  );
}

export function sealPredatorDetails<T extends Record<string, string>>(
  details: T | null | undefined
): T | null {
  if (!details) return null;

  const sealed = { ...details } as Record<string, string>;
  for (const field of SENSITIVE_PREDATOR_KEYS) {
    const value = sealed[field];
    if (typeof value === "string" && value.length > 0) {
      sealed[field] = encryptSecret(value);
    }
  }

  return sealed as T;
}

export function revealPredatorDetails<T extends Record<string, string>>(
  details: T | null | undefined
): T | null {
  if (!details) return null;

  const revealed = { ...details } as Record<string, string>;
  for (const field of SENSITIVE_PREDATOR_KEYS) {
    const value = revealed[field];
    if (typeof value === "string" && value.startsWith(ENCRYPTED_PREFIX)) {
      revealed[field] = decryptSecret(value);
    }
  }

  return revealed as T;
}

export function sealRelinkingDetails<T extends Record<string, string>>(
  details: T | null | undefined
): T | null {
  if (!details) return null;

  const sealed = { ...details } as Record<string, string>;
  for (const field of SENSITIVE_RELINKING_KEYS) {
    const value = sealed[field];
    if (typeof value === "string" && value.length > 0) {
      sealed[field] = encryptSecret(value);
    }
  }

  return sealed as T;
}

export function revealRelinkingDetails<T extends Record<string, string>>(
  details: T | null | undefined
): T | null {
  if (!details) return null;

  const revealed = { ...details } as Record<string, string>;
  for (const field of SENSITIVE_RELINKING_KEYS) {
    const value = revealed[field];
    if (typeof value === "string" && value.startsWith(ENCRYPTED_PREFIX)) {
      revealed[field] = decryptSecret(value);
    }
  }

  return revealed as T;
}

export function sealCheckoutPayload(payload: {
  unbanDetails?: Record<string, string | null> | null;
  predatorDetails?: Record<string, string | null> | null;
  relinkingDetails?: Record<string, string | null> | null;
  [key: string]: unknown;
}) {
  return {
    ...payload,
    predatorDetails: payload.predatorDetails
      ? sealPredatorDetails(
          payload.predatorDetails as Record<string, string>
        )
      : null,
    relinkingDetails: payload.relinkingDetails
      ? sealRelinkingDetails(
          payload.relinkingDetails as Record<string, string>
        )
      : null,
  };
}

export function revealOrderMetadata(metadata: Record<string, unknown> | null) {
  if (!metadata || typeof metadata !== "object") {
    return metadata ?? {};
  }

  let result = { ...metadata };

  const predator = metadata.predator;
  if (predator && typeof predator === "object") {
    result = {
      ...result,
      predator: revealPredatorDetails(predator as Record<string, string>),
    };
  }

  const relinking = metadata.relinking;
  if (relinking && typeof relinking === "object") {
    result = {
      ...result,
      relinking: revealRelinkingDetails(relinking as Record<string, string>),
    };
  }

  return result;
}
