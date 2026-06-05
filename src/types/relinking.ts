export type RelinkingPlatform = "psn" | "xbox" | "steam";

export type RelinkingIntakeDetails = {
  platform: RelinkingPlatform;
  eaAccount: string;
  eaEmail: string;
  eaPassword: string;
  eaBackupCode: string;
};

export const RELINKING_PLATFORM_LABELS: Record<RelinkingPlatform, string> = {
  psn: "PSN (PlayStation)",
  xbox: "Xbox",
  steam: "Steam",
};

export function formatRelinkingServiceDetail(
  details: Pick<RelinkingIntakeDetails, "platform">
): string {
  return `From ${RELINKING_PLATFORM_LABELS[details.platform]}`;
}

export function formatRelinkingNotes(
  details: RelinkingIntakeDetails,
  customerDiscord: string
): string {
  return [
    `Discord: ${customerDiscord}`,
    `Relinking from: ${RELINKING_PLATFORM_LABELS[details.platform]}`,
    `EA account: ${details.eaAccount}`,
    `EA email: ${details.eaEmail}`,
    `Credentials: stored encrypted in order metadata (admin view).`,
  ].join("\n");
}
