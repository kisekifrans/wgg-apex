/** Labels for reviews and completed-boost CMS entries. */
export const CMS_SERVICE_TYPES = [
  "Ranked Boosting",
  "Predator Maintenance",
  "Badge Boosting",
  "Kills Farming",
  "Mythic Prestige Damage",
  "Unban Service",
  "Account Relinking",
  "Duo Ranked Boost",
] as const;

export type CmsServiceType = (typeof CMS_SERVICE_TYPES)[number];
