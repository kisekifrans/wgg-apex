import { ExternalLink, MessageCircle, Users, Zap } from "lucide-react";

import {
  AnimatedItem,
  AnimatedSection,
  AnimatedStagger,
} from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import { DiscordWidgetEmbed } from "@/components/marketing/discord-widget-embed";
import { Button } from "@/components/ui/button";
import { getDiscordCommunityConfig } from "@/config/discord-community";

const highlights = [
  {
    icon: Zap,
    title: "Fast Operator Support",
    description:
      "Order questions, rank updates, and marketplace interest—handled in real time by our team",
  },
  {
    icon: Users,
    title: "Active Player Community",
    description:
      "See who's online, chat with other grinders, and catch new listings first",
  },
  {
    icon: MessageCircle,
    title: "Official WGG Server",
    description:
      "One verified Discord for services, marketplace drops, and announcements—no impersonators",
  },
] as const;

export function DiscordCommunitySection() {
  const discord = getDiscordCommunityConfig();
  if (!discord.isEnabled || !discord.serverId) {
    return null;
  }

  return (
    <AnimatedSection
      id="discord"
      className="border-t border-white/[0.06] py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeader
              eyebrow="Community"
              title="Join Our Official Discord"
              description="We're active on Discord—live support, marketplace drops, and a competitive player community."
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
                  Join Discord Server
                  <ExternalLink className="size-4" data-icon="inline-end" />
                </Button>
              </div>
            ) : null}
          </div>

          <div className="flex justify-center lg:justify-end">
            <DiscordWidgetEmbed serverId={discord.serverId} />
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
