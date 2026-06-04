export type PredatorIntakeDetails = {
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
    `Nintendo backup code: ${details.nintendoBackupCode}`,
    `EA Email: ${details.eaEmail}`,
    `EA Password: ${details.eaPassword}`,
    `EA Backup code: ${details.eaBackupCode}`,
  ].join("\n");
}
