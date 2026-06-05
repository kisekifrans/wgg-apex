export type RelinkingPlatform = "psn" | "xbox" | "steam";

export type RelinkingIntakeDetails = {
  platform: RelinkingPlatform;
  eaAccount: string;
  eaEmail: string;
  eaPassword: string;
  eaBackupCode: string;
  steamId?: string;
  steamPassword?: string;
  xboxEmail?: string;
  xboxPassword?: string;
  psnEmail?: string;
  psnPassword?: string;
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
    `Platform credentials: stored encrypted in order metadata (admin view).`,
  ].join("\n");
}

export function buildRelinkingDetailsFromParsed(data: {
  platform: RelinkingPlatform;
  eaAccount: string;
  eaEmail: string;
  eaPassword: string;
  eaBackupCode: string;
  steamId?: string;
  steamPassword?: string;
  xboxEmail?: string;
  xboxPassword?: string;
  psnEmail?: string;
  psnPassword?: string;
}): RelinkingIntakeDetails {
  const base = {
    platform: data.platform,
    eaAccount: data.eaAccount,
    eaEmail: data.eaEmail,
    eaPassword: data.eaPassword,
    eaBackupCode: data.eaBackupCode,
  };

  if (data.platform === "steam") {
    return {
      ...base,
      steamId: data.steamId!.trim(),
      steamPassword: data.steamPassword!.trim(),
    };
  }

  if (data.platform === "xbox") {
    return {
      ...base,
      xboxEmail: data.xboxEmail!.trim(),
      xboxPassword: data.xboxPassword!.trim(),
    };
  }

  return {
    ...base,
    psnEmail: data.psnEmail!.trim(),
    psnPassword: data.psnPassword!.trim(),
  };
}
