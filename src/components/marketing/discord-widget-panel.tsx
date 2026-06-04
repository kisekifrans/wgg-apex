import { ExternalLink, Users } from "lucide-react";

import type { DiscordCommunityWidget } from "@/lib/discord/community-widget";
import { cn } from "@/lib/utils";

type DiscordWidgetPanelProps = {
  widget: DiscordCommunityWidget | null;
  inviteUrl: string | null;
  className?: string;
};

const statusColors: Record<string, string> = {
  online: "bg-emerald-500",
  idle: "bg-amber-500",
  dnd: "bg-red-500",
};

export function DiscordWidgetPanel({
  widget,
  inviteUrl,
  className,
}: DiscordWidgetPanelProps) {
  const joinHref = widget?.instantInvite ?? inviteUrl;
  const serverName = widget?.serverName ?? "WGG Discord";
  const onlineCount = widget?.presenceCount;
  const members = widget?.members ?? [];

  return (
    <div
      className={cn(
        "flex w-full max-w-[350px] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#313338] text-[#dbdee1] shadow-[0_0_48px_-12px] shadow-[rgba(88,101,242,0.35)]",
        className
      )}
    >
      <div className="border-b border-[#1e1f22] bg-[#2b2d31] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-[#5865F2]">
            <svg
              viewBox="0 0 24 24"
              className="size-5 fill-white"
              aria-hidden
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 12.3 12.3 0 0 0-.608 1.248 18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.248.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01 10.2 10.2 0 0 0 .372.292.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{serverName}</p>
            <p className="flex items-center gap-1.5 text-xs text-[#b5bac1]">
              <Users className="size-3.5 shrink-0" aria-hidden />
              {typeof onlineCount === "number" ? (
                <>
                  <span className="font-medium text-emerald-400">
                    {onlineCount}
                  </span>{" "}
                  online now
                </>
              ) : (
                "Join our community"
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-[280px] flex-1 px-3 py-3">
        {members.length > 0 ? (
          <ul className="space-y-1">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-[#35373c]"
              >
                <div className="relative size-8 shrink-0">
                  {member.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Discord CDN avatars
                    <img
                      src={member.avatarUrl}
                      alt=""
                      width={32}
                      height={32}
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#5865F2] text-xs font-semibold text-white">
                      {member.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#313338]",
                      statusColors[member.status] ?? "bg-[#80848e]"
                    )}
                    aria-hidden
                  />
                </div>
                <span className="truncate text-sm text-[#f2f3f5]">
                  {member.username}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-4 text-center">
            <p className="text-sm text-[#b5bac1]">
              Join the server to chat with the community and see who is online.
            </p>
          </div>
        )}
      </div>

      {joinHref ? (
        <div className="border-t border-[#1e1f22] p-3">
          <a
            href={joinHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#5865F2] text-sm font-medium text-white transition-colors hover:bg-[#4752C4]"
          >
            Join Server
            <ExternalLink className="size-4" aria-hidden />
          </a>
        </div>
      ) : null}
    </div>
  );
}
