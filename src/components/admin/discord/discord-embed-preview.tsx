"use client";

import Image from "next/image";
import Link from "next/link";

import { buildMarketplaceEmbed } from "@/lib/discord/build-marketplace-embed";
import { DISCORD_EMBED_COLOR } from "@/lib/discord/constants";
import type { DiscordEmbed } from "@/lib/discord/types";
import { cn } from "@/lib/utils";
import type { MarketplaceListing } from "@/types/marketplace";

type DiscordEmbedPreviewProps = {
  listing: MarketplaceListing;
  siteUrl: string;
  ownerUserId?: string;
  className?: string;
};

/** Visual approximation of a Discord embed (dark theme). */
export function DiscordEmbedPreview({
  listing,
  siteUrl,
  ownerUserId,
  className,
}: DiscordEmbedPreviewProps) {
  const payload = buildMarketplaceEmbed(listing, { siteUrl, ownerUserId });
  const embed = payload.embeds[0] as DiscordEmbed | undefined;

  if (!embed) return null;

  const barColor = `#${DISCORD_EMBED_COLOR.toString(16).padStart(6, "0")}`;

  return (
    <div className={cn("space-y-2", className)}>
      {payload.content && (
        <p className="rounded-lg border border-[#1e1f22] bg-[#313338] px-3 py-2 text-sm text-[#dbdee1]">
          {payload.content.replace(
            /<@(\d+)>/g,
            (_, id) => `@owner (${id})`
          )}
        </p>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-[#1e1f22] bg-[#2b2d31] text-[#dbdee1]"
        )}
      >
      <div className="flex gap-0">
        <div
          className="w-1 shrink-0"
          style={{ backgroundColor: barColor }}
          aria-hidden
        />
        <div className="min-w-0 flex-1 px-3 py-2.5">
          <div className="mb-1 flex items-center gap-2 text-xs text-[#949ba4]">
            {payload.avatar_url ? (
              <span className="relative size-5 shrink-0 overflow-hidden rounded-full">
                <Image
                  src={payload.avatar_url}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 object-cover"
                  unoptimized
                />
              </span>
            ) : null}
            <span className="font-semibold text-[#f2f3f5]">
              {payload.username ?? "WGG Apex"}
            </span>
            <span>APP</span>
            <span className="text-[10px]">Preview</span>
          </div>

          <div className="rounded-none bg-transparent pl-0">
            {embed.url ? (
              <Link
                href={embed.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-semibold text-[#00a8fc] hover:underline"
              >
                {embed.title}
              </Link>
            ) : (
              <p className="text-base font-semibold text-[#00a8fc]">{embed.title}</p>
            )}

            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#dbdee1]">
              {embed.description}
            </p>

            {embed.fields && embed.fields.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                {embed.fields.map((field) => (
                  <div
                    key={field.name}
                    className={cn(
                      "min-w-0",
                      field.inline === false && "col-span-full"
                    )}
                  >
                    <p className="text-xs font-semibold text-[#b5bac1]">
                      {field.name}
                    </p>
                    <p className="whitespace-pre-wrap text-sm text-[#dbdee1]">
                      {field.value.replace(
                        /<@(\d+)>/g,
                        (_, id) => `@owner (${id})`
                      )}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {embed.image?.url && (
              <div className="relative mt-3 max-h-48 overflow-hidden rounded-md border border-[#1e1f22]">
                <Image
                  src={embed.image.url}
                  alt=""
                  width={400}
                  height={192}
                  className="h-auto max-h-48 w-full object-cover"
                  unoptimized
                />
              </div>
            )}

            {embed.footer?.text && (
              <p className="mt-2 text-xs text-[#949ba4]">{embed.footer.text}</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
