import Link from "next/link";
import { ArrowRight, BadgeCheck, Monitor } from "lucide-react";

import {
  AnimatedItem,
  AnimatedSection,
  AnimatedStagger,
} from "@/components/shared/animated-section";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { featuredAccounts } from "@/config/platform";

export function FeaturedAccountsSection() {
  return (
    <AnimatedSection id="accounts" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            eyebrow="Marketplace"
            title="Featured accounts for sale"
            description="Operator-verified listings with disclosed rank, RP, and platform. Purchases flow through secure checkout—not peer-to-peer transfers."
          />
          <Button
            variant="ghost"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            render={<Link href="/marketplace" />}
          >
            Browse marketplace
            <ArrowRight className="size-4" data-icon="inline-end" />
          </Button>
        </div>

        <AnimatedStagger className="mt-12 grid gap-4 md:grid-cols-3">
          {featuredAccounts.map((account) => (
            <AnimatedItem key={account.id}>
              <Card className="flex h-full flex-col border-white/5 bg-card/50 transition-colors hover:border-primary/20 hover:bg-card/70">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{account.title}</CardTitle>
                    {account.verified && (
                      <Badge
                        variant="outline"
                        className="shrink-0 gap-1 border-primary/30 bg-primary/10 text-primary"
                      >
                        <BadgeCheck className="size-3" aria-hidden />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Monitor className="size-4" aria-hidden />
                    {account.platform}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Rank</dt>
                      <dd className="font-medium">{account.rank}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">RP</dt>
                      <dd className="font-mono tabular-nums font-medium">
                        {account.rp}
                      </dd>
                    </div>
                  </dl>
                  <ul className="flex flex-wrap gap-1.5">
                    {account.tags.map((tag) => (
                      <li key={tag}>
                        <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
                          {tag}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-mono text-xl font-semibold tabular-nums">
                    ${account.price}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/10"
                    render={
                      <Link href={`/marketplace/${account.id}`}>View</Link>
                    }
                  >
                    View listing
                  </Button>
                </CardFooter>
              </Card>
            </AnimatedItem>
          ))}
        </AnimatedStagger>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Listings are subject to availability. Transfer and compliance terms
          apply at checkout.
        </p>
      </div>
    </AnimatedSection>
  );
}
