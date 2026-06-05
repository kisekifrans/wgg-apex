export type PredatorRankProgressStatus = "pending" | "in_progress" | "completed";

export type PredatorRankProgress = {
  id: string;
  orderId: string;
  rankLabel: string;
  status: PredatorRankProgressStatus;
  completedAt: string | null;
  sortOrder: number;
  notes: string | null;
};

export type PredatorIntakeDetails = {
  nintendoEmail: string;
  nintendoPassword: string;
  nintendoBackupCode: string;
  eaEmail: string;
  eaPassword: string;
  eaBackupCode: string;
};

export function formatPredatorNotes(
  details: PredatorIntakeDetails,
  customerDiscord: string,
  currentRank: string,
  planName: string
): string {
  return [
    `Discord: ${customerDiscord}`,
    `Plan: ${planName}`,
    `Current rank / RP: ${currentRank}`,
    `Platform: Nintendo (Switch)`,
    `Nintendo email: ${details.nintendoEmail}`,
    `EA Email: ${details.eaEmail}`,
    `Account credentials: stored encrypted in order metadata (admin view).`,
  ].join("\n");
}
