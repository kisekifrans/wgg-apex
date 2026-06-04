/**
 * Public Discord community panel (homepage).
 * Live member list requires Server Settings → Widget → Enable Server Widget.
 */
export function getDiscordCommunityConfig() {
  const serverId = process.env.NEXT_PUBLIC_DISCORD_SERVER_ID?.trim() ?? "";
  const inviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim() ?? "";

  const isEnabled = serverId.length > 0;

  return {
    isEnabled,
    serverId: isEnabled ? serverId : null,
    inviteUrl: inviteUrl.length > 0 ? inviteUrl : null,
  } as const;
}

/** Official Discord widget iframe URL (`theme=dark`, 350×500). */
export function getDiscordWidgetEmbedUrl(serverId: string): string {
  return `https://discord.com/widget?id=${encodeURIComponent(serverId)}&theme=dark`;
}
