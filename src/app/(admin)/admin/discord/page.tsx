import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DiscordPublishLogTable } from "@/components/admin/discord/discord-publish-log-table";
import { DiscordToolsClient } from "@/components/admin/discord/discord-tools-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentDiscordPublishLogs } from "@/lib/db/discord-publish-logs";
import {
  getDiscordMarketplaceConfig,
  maskWebhookUrl,
} from "@/lib/discord/env";

export const metadata = {
  title: "Discord Tools",
};

export default async function AdminDiscordPage() {
  const config = getDiscordMarketplaceConfig();
  let logs: Awaited<ReturnType<typeof getRecentDiscordPublishLogs>> = [];

  try {
    logs = await getRecentDiscordPublishLogs(25);
  } catch {
    logs = [];
  }

  return (
    <>
      <AdminPageHeader
        title="Discord Tools"
        description="Publish marketplace listings to Discord with rich embeds."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Marketplace webhook
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <span
                className={
                  config.isConfigured ? "text-primary" : "text-destructive"
                }
              >
                {config.isConfigured ? "Configured" : "Not configured"}
              </span>
            </div>
            {config.webhookUrl && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Webhook</span>
                <code className="text-xs">{maskWebhookUrl(config.webhookUrl)}</code>
              </div>
            )}
            <p className="text-muted-foreground leading-relaxed">
              Create a webhook in your Discord server:{" "}
              <strong className="text-foreground">Server Settings → Integrations → Webhooks</strong>.
              Copy the URL into{" "}
              <code className="text-xs">DISCORD_MARKETPLACE_WEBHOOK_URL</code>{" "}
              (local <code className="text-xs">.env.local</code> or Vercel env).
            </p>
            <DiscordToolsClient disabled={!config.isConfigured} />
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="font-heading text-lg">How publishing works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Open any marketplace listing → use the Discord preview panel → click{" "}
              <strong className="text-foreground">Publish to Discord</strong>.
            </p>
            <p>
              Embeds include cover image, price, rank, platform, status, and a link to
              the public listing page.
            </p>
            <p>
              Optional: <code className="text-xs">DISCORD_PUBLISH_COOLDOWN_SECONDS</code>{" "}
              (default 300) limits repeat posts unless you confirm republish.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 border-white/5 bg-card/50">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Recent publish log</CardTitle>
        </CardHeader>
        <CardContent>
          <DiscordPublishLogTable logs={logs} />
        </CardContent>
      </Card>
    </>
  );
}
