export type RelinkingPlatform = "ea" | "psn" | "xbox" | "steam";

export type RelinkingIntakeDetails = {
  platform: RelinkingPlatform;
  accountId: string;
  email: string;
  password: string;
  backupCode: string;
};

export const RELINKING_PLATFORM_LABELS: Record<RelinkingPlatform, string> = {
  ea: "EA",
  psn: "PSN (PlayStation)",
  xbox: "Xbox",
  steam: "Steam",
};

export function formatRelinkingNotes(
  details: RelinkingIntakeDetails,
  customerDiscord: string
): string {
  return [
    `Discord: ${customerDiscord}`,
    `Platform: ${RELINKING_PLATFORM_LABELS[details.platform]}`,
    `Account ID: ${details.accountId}`,
    `Email: ${details.email}`,
    `Credentials: stored encrypted in order metadata (admin view).`,
  ].join("\n");
}
