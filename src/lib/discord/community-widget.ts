/** Discord Server Widget JSON — requires Server Settings → Widget → Enable Server Widget */

export type DiscordWidgetMember = {
  id: string;
  username: string;
  status: string;
  avatarUrl: string | null;
};

export type DiscordCommunityWidget = {
  serverName: string;
  presenceCount: number;
  instantInvite: string | null;
  members: DiscordWidgetMember[];
};

export type DiscordWidgetFetchResult =
  | { status: "ok"; widget: DiscordCommunityWidget }
  | {
      status: "unavailable";
      reason: "widget_disabled" | "fetch_failed";
    };

type RawWidgetMember = {
  id: string;
  username: string;
  status: string;
  avatar_url?: string | null;
};

type RawWidgetJson = {
  name?: string;
  instant_invite?: string | null;
  presence_count?: number;
  members?: RawWidgetMember[];
};

function parseWidgetJson(json: RawWidgetJson): DiscordCommunityWidget {
  const members = (json.members ?? [])
    .filter((m) => m.status === "online" || m.status === "idle" || m.status === "dnd")
    .slice(0, 12)
    .map((m) => ({
      id: m.id,
      username: m.username,
      status: m.status,
      avatarUrl: m.avatar_url ?? null,
    }));

  return {
    serverName: json.name?.trim() || "Discord",
    presenceCount:
      typeof json.presence_count === "number" ? json.presence_count : members.length,
    instantInvite: json.instant_invite?.trim() || null,
    members,
  };
}

export async function fetchDiscordCommunityWidget(
  serverId: string
): Promise<DiscordWidgetFetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const res = await fetch(
      `https://discord.com/api/guilds/${encodeURIComponent(serverId)}/widget.json`,
      { next: { revalidate: 120 }, signal: controller.signal }
    );

    if (!res.ok) {
      let reason: "widget_disabled" | "fetch_failed" = "fetch_failed";
      try {
        const err = (await res.json()) as { code?: number };
        if (err.code === 50_004) reason = "widget_disabled";
      } catch {
        /* ignore */
      }
      if (res.status === 403 || res.status === 404) reason = "widget_disabled";
      return { status: "unavailable", reason };
    }

    const json = (await res.json()) as RawWidgetJson;
    return { status: "ok", widget: parseWidgetJson(json) };
  } catch {
    return { status: "unavailable", reason: "fetch_failed" };
  } finally {
    clearTimeout(timeout);
  }
}
