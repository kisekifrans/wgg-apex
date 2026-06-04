export type DiscordEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

export type DiscordEmbed = {
  title?: string;
  url?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  image?: { url: string };
  footer?: { text: string };
  timestamp?: string;
};

export type DiscordAllowedMentions = {
  parse?: ("roles" | "users" | "everyone")[];
  users?: string[];
};

export type DiscordWebhookPayload = {
  content?: string;
  allowed_mentions?: DiscordAllowedMentions;
  username?: string;
  avatar_url?: string;
  embeds: DiscordEmbed[];
};

export type DiscordPublishResult = {
  logId: string;
  messageId: string | null;
  channelId: string | null;
};
