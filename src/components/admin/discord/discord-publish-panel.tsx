"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { publishListingToDiscord } from "@/actions/admin/discord/publish-listing";
import { DiscordEmbedPreview } from "@/components/admin/discord/discord-embed-preview";
import { Button } from "@/components/ui/button";
import {
  canPublishListingToDiscord,
} from "@/lib/discord/build-marketplace-embed";
import type { DiscordPublishLog } from "@/lib/db/discord-publish-logs";
import type { MarketplaceListing } from "@/types/marketplace";

type DiscordPublishPanelProps = {
  listing: MarketplaceListing;
  siteUrl: string;
  ownerUserId?: string;
  webhookConfigured: boolean;
  latestLog: DiscordPublishLog | null;
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DiscordPublishPanel({
  listing,
  siteUrl,
  ownerUserId,
  webhookConfigured,
  latestLog,
}: DiscordPublishPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const eligibility = canPublishListingToDiscord(listing);
  const canPublish =
    webhookConfigured && eligibility.ok && !loading;

  async function handlePublish() {
    if (!webhookConfigured || !eligibility.ok) return;

    const isRepublish = latestLog?.status === "success";
    if (
      isRepublish &&
      !confirm("This listing was published before. Post again to Discord?")
    ) {
      return;
    }

    setLoading(true);
    const result = await publishListingToDiscord(listing.id, {
      force: isRepublish,
    });
    setLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Published to Discord");
    router.refresh();
  }

  return (
    <div className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Discord
          </p>
          <h3 className="font-heading mt-1 text-sm font-semibold">
            Channel preview
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            How this listing will appear when posted to your marketplace webhook.
          </p>
        </div>
        {latestLog && (
          <span
            className={
              latestLog.status === "success"
                ? "shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                : "shrink-0 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive"
            }
          >
            {latestLog.status === "success" ? "Published" : "Failed"}{" "}
            {formatRelativeTime(latestLog.createdAt)}
          </span>
        )}
      </div>

      <DiscordEmbedPreview
        listing={listing}
        siteUrl={siteUrl}
        ownerUserId={ownerUserId}
      />

      {!webhookConfigured && (
        <p className="text-xs text-amber-400/90">
          Add <code className="text-foreground/90">DISCORD_MARKETPLACE_WEBHOOK_URL</code>{" "}
          to your environment (see Admin → Discord Tools).
        </p>
      )}

      {!eligibility.ok && (
        <p className="text-xs text-muted-foreground">{eligibility.reason}</p>
      )}

      {latestLog?.status === "failed" && latestLog.errorMessage && (
        <p className="text-xs text-destructive">{latestLog.errorMessage}</p>
      )}

      <Button
        type="button"
        variant="outline"
        className="w-full border-[#5865f2]/40 text-[#dbdee1] hover:border-[#5865f2] hover:bg-[#5865f2]/10"
        disabled={!canPublish}
        onClick={() => void handlePublish()}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            Publishing…
          </>
        ) : (
          <>
            <MessageCircle className="size-4" data-icon="inline-start" />
            Publish to Discord
          </>
        )}
      </Button>
    </div>
  );
}
