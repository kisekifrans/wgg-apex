import { ArrowUpRight, ClipboardList, DollarSign, Package } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getServiceOrderStats } from "@/lib/db/service-orders";
import { getAdminMarketplaceListings } from "@/lib/db/marketplace-listings";

export async function OverviewStats() {
  let paidAwaiting = "—";
  let inProgress = "—";
  let pending = "—";
  let activeListings = "—";

  try {
    const stats = await getServiceOrderStats();
    paidAwaiting = String(stats.paidAwaitingStart);
    inProgress = String(stats.inProgress);
    pending = String(stats.pendingCount);
  } catch {
    // Supabase not migrated or unavailable
  }

  try {
    const listings = await getAdminMarketplaceListings({
      status: "available",
    });
    activeListings = String(listings.length);
  } catch {
    // ignore
  }

  const stats = [
    {
      label: "Paid awaiting start",
      value: paidAwaiting,
      href: "/admin/orders?status=paid",
      icon: ClipboardList,
    },
    {
      label: "In progress",
      value: inProgress,
      href: "/admin/orders?status=in_progress",
      icon: Package,
    },
    {
      label: "Pending orders",
      value: pending,
      href: "/admin/orders?status=pending",
      icon: DollarSign,
    },
    {
      label: "Active listings",
      value: activeListings,
      href: "/admin/marketplace?status=available",
      icon: ArrowUpRight,
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Link key={stat.label} href={stat.href} className="group block">
            <Card className="border-white/5 bg-card/50 transition-colors hover:border-primary/20 hover:bg-card/70">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon
                  className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
                  aria-hidden
                />
              </CardHeader>
              <CardContent>
                <p className="font-mono text-2xl font-semibold tabular-nums tracking-tight">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
