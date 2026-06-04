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

export type DiscordWebhookPayload = {
  username?: string;
  avatar_url?: string;
  embeds: DiscordEmbed[];
};

export type DiscordPublishResult = {
  logId: string;
  messageId: string | null;
  channelId: string | null;
};
