import { getDiscordWidgetEmbedUrl } from "@/config/discord-community";

type DiscordWidgetEmbedProps = {
  serverId: string;
};

/** Official Discord server widget iframe (Server Settings → Widget). */
export function DiscordWidgetEmbed({ serverId }: DiscordWidgetEmbedProps) {
  const src = getDiscordWidgetEmbedUrl(serverId);

  return (
    <div className="w-full max-w-[350px] overflow-hidden rounded-xl border border-white/10 bg-[#313338] shadow-[0_0_48px_-12px] shadow-[rgba(88,101,242,0.35)]">
      <iframe
        src={src}
        title="WGG Apex Discord server"
        width={350}
        height={500}
        className="block w-full border-0"
        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      />
    </div>
  );
}
