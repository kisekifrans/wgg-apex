import { parseRankTierFromLabel } from "@/config/brand-assets";

/** Custom rank emojis uploaded to the WGG Apex Discord server. */
export type DiscordRankEmoji = {
  /** Exact Discord emoji name (include ~N when Discord renamed a duplicate). */
  name: string;
  id: string;
};

export const DISCORD_RANK_EMOJIS: Partial<Record<string, DiscordRankEmoji>> = {
  Bronze: { name: "bronze~1", id: "1512649444041167000" },
  Silver: { name: "silver~1", id: "1512649416899563570" },
  Gold: { name: "gold", id: "1512649398276984995" },
  Platinum: { name: "platinum", id: "1512649360268333251" },
  Diamond: { name: "diamond", id: "1512649338579456081" },
  Master: { name: "master", id: "1113453723843301396" },
  Predator: { name: "predator", id: "1512649268450689094" },
};

export function discordRankEmojiToken(tier: string): string | null {
  const emoji = DISCORD_RANK_EMOJIS[tier];
  if (!emoji) return null;
  return `<:${emoji.name}:${emoji.id}>`;
}

/** Prefix a rank label with the matching Discord custom emoji when configured. */
export function formatRankLabelForDiscord(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return trimmed;

  const tier = parseRankTierFromLabel(trimmed);
  if (!tier) return trimmed;

  const token = discordRankEmojiToken(tier);
  if (!token) return trimmed;

  return `${token} ${trimmed}`;
}

export function formatRankClimbForDiscord(fromRank: string, toRank: string): string {
  return `${formatRankLabelForDiscord(fromRank)} → ${formatRankLabelForDiscord(toRank)}`;
}
