import Link from "next/link";

import type { DiscordPublishLog } from "@/lib/db/discord-publish-logs";

export function DiscordPublishLogTable({ logs }: { logs: DiscordPublishLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No publish attempts yet. Publish a marketplace listing to see history here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/5">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02] text-xs text-muted-foreground">
            <th className="px-3 py-2 font-medium">Listing</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Note</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-white/5 last:border-0">
              <td className="px-3 py-2">
                <Link
                  href={`/admin/marketplace/${log.listingId}`}
                  className="font-medium text-primary hover:underline"
                >
                  {log.listingNumber ?? log.listingTitle ?? log.listingId.slice(0, 8)}
                </Link>
              </td>
              <td className="px-3 py-2">
                <span
                  className={
                    log.status === "success"
                      ? "text-primary"
                      : "text-destructive"
                  }
                >
                  {log.status}
                </span>
              </td>
              <td className="px-3 py-2 text-muted-foreground">
                {new Date(log.createdAt).toLocaleString()}
              </td>
              <td className="max-w-[200px] truncate px-3 py-2 text-muted-foreground">
                {log.errorMessage ?? (log.discordMessageId ? "OK" : "—")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
