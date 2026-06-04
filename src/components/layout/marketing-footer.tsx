import Link from "next/link";
import { Shield } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Separator } from "@/components/ui/separator";
import { getDiscordCommunityConfig } from "@/config/discord-community";
import { footerLinks } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export function MarketingFooter() {
  const discord = getDiscordCommunityConfig();

  return (
    <footer className="border-t border-white/5 bg-[#0F0F12]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo variant="footer" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Premium Apex Legends services—ranked boosting, Predator
              maintenance, badges, unban support, and verified accounts.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="size-3.5 text-primary" aria-hidden />
              <span>Payments secured by Stripe</span>
            </div>
          </div>

          <FooterColumn title="Services" links={footerLinks.services} />
          <FooterColumn
            title="Company"
            links={footerLinks.company}
            extraLinks={
              discord.inviteUrl
                ? [{ label: "Discord", href: discord.inviteUrl, external: true }]
                : discord.isEnabled
                  ? [{ label: "Discord", href: "#discord", external: false }]
                  : undefined
            }
          />
          <FooterColumn title="Legal" links={footerLinks.legal} />
        </div>

        <Separator className="my-10 bg-white/5" />

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="font-mono tabular-nums">Built for competitive players</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  extraLinks,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
  extraLinks?: readonly {
    label: string;
    href: string;
    external?: boolean;
  }[];
}) {
  const allLinks = extraLinks ? [...links, ...extraLinks] : links;

  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-foreground">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {allLinks.map((link) => (
          <li key={link.label}>
            {"external" in link && link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
