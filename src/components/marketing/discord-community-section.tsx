import { ExternalLink, MessageCircle, Users, Zap } from "lucide-react";

import {
  AnimatedItem,
  AnimatedSection,
  AnimatedStagger,
} from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import { DiscordWidgetPanel } from "@/components/marketing/discord-widget-panel";
import { Button } from "@/components/ui/button";
import { getDiscordCommunityConfig } from "@/config/discord-community";
import { fetchDiscordCommunityWidget } from "@/lib/discord/community-widget";

const highlights = [
  {
    icon: Zap,
    title: "Fast operator support",
    description:
      "Order questions, rank updates, and marketplace interest—handled in real time by our team.",
  },
  {
    icon: Users,
    title: "Active player community",
    description:
      "See who is online, chat with other competitive players, and stay close to new listings.",
  },
  {
    icon: MessageCircle,
    title: "Official WGG server",
    description:
      "One verified Discord for services, marketplace drops, and announcements—no impersonators.",
  },
] as const;

export async function DiscordCommunitySection() {
  const discord = getDiscordCommunityConfig();
  if (!discord.isEnabled || !discord.serverId) {
    return null;
  }

  const widgetResult = await fetchDiscordCommunityWidget(discord.serverId);
  const widget =
    widgetResult.status === "ok" ? widgetResult.widget : null;

  return (
    <AnimatedSection
      id="discord"
      className="border-t border-white/5 bg-[#0F0F12]/50 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeader
              eyebrow="Community"
              title="Join our official Discord"
              description="We are very active on Discord—live support, marketplace updates, and a competitive player community."
            />

            <AnimatedStagger className="mt-10 grid gap-4">
              {highlights.map((item) => {
                const Icon = item.icon;
                return (
                  <AnimatedItem key={item.title}>
                    <div className="flex gap-4 rounded-xl border border-white/5 bg-card/40 p-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary">
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </AnimatedItem>
                );
              })}
            </AnimatedStagger>

            {discord.inviteUrl ? (
              <div className="mt-8">
                <Button
                  size="lg"
                  className="h-11 bg-[#5865F2] font-medium text-white hover:bg-[#4752C4]"
                  nativeButton={false}
                  render={
                    <a
                      href={discord.inviteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  Join Discord server
                  <ExternalLink className="size-4" data-icon="inline-end" />
                </Button>
              </div>
            ) : null}
          </div>

          <div className="flex justify-center lg:justify-end">
            <DiscordWidgetPanel
              widget={widget}
              inviteUrl={discord.inviteUrl}
            />
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
