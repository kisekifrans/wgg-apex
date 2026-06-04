import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type LegalPageLayoutProps = {
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
};

const legalNav = [
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Refund Policy", href: "/legal/refund-policy" },
] as const;

export function LegalPageLayout({
  title,
  description,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="relative">
      <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-8 text-muted-foreground"
          render={<Link href="/" />}
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back to home
        </Button>

        <header>
          <p className="text-sm font-medium tracking-wide text-[var(--brand-gold)]">
            Legal
          </p>
          <h1 className="font-heading mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </header>

        <nav
          className="mt-8 flex flex-wrap gap-2"
          aria-label="Legal documents"
        >
          {legalNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/25 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <article
          className={cn(
            "glass-panel mt-10 space-y-8 rounded-2xl p-6 sm:p-10",
            "[&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground",
            "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground",
            "[&_p]:leading-relaxed [&_p]:text-muted-foreground",
            "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-muted-foreground",
            "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:text-muted-foreground",
            "[&_a]:font-medium [&_a]:text-primary [&_a]:hover:underline",
            "[&_li]:leading-relaxed"
          )}
        >
          {children}
        </article>

        <p className="mt-10 text-xs leading-relaxed text-muted-foreground">
          Questions about these policies? Contact{" "}
          <a href={`mailto:${siteConfig.supportEmail}`} className="text-primary hover:underline">
            {siteConfig.supportEmail}
          </a>
          . {siteConfig.name} is not affiliated with Electronic Arts or Respawn
          Entertainment.
        </p>
      </div>
    </div>
  );
}
