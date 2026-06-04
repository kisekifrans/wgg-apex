export type UnbanIntakeDetails = {
  eaLoginId: string;
  eaEmail: string;
  banDate: string;
  previousAppeals: string;
  additionalNotes: string | null;
};

export function formatUnbanNotes(
  details: UnbanIntakeDetails,
  customerDiscord: string
): string {
  const lines = [
    `Discord: ${customerDiscord}`,
    `EA Login ID: ${details.eaLoginId}`,
    `EA Email: ${details.eaEmail}`,
    `Ban Date: ${details.banDate}`,
    `Previous Appeals: ${details.previousAppeals}`,
  ];

  if (details.additionalNotes?.trim()) {
    lines.push(`Additional Notes: ${details.additionalNotes.trim()}`);
  }

  return lines.join("\n");
}
