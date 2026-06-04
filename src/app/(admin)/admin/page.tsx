import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OverviewStats } from "@/components/admin/overview-stats";
import { PagePlaceholder } from "@/components/admin/page-placeholder";
import { Button } from "@/components/ui/button";
import { adminNavItems } from "@/config/admin-nav";

export const metadata = {
  title: "Overview",
};

export default function AdminOverviewPage() {
  const quickLinks = adminNavItems.filter((item) => item.href !== "/admin");

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="Operations snapshot across orders, services, and marketplace listings."
      >
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
          render={<Link href="/admin/orders" />}
        >
          View orders
        </Button>
      </AdminPageHeader>

      <OverviewStats />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <PagePlaceholder
          title="Recent activity"
          description="Order timeline and status history will appear here in a future update."
        />

        <div className="rounded-xl border border-white/5 bg-card/50 p-6">
          <h2 className="font-heading text-lg font-semibold">Quick links</h2>
          <ul className="mt-4 space-y-2">
            {quickLinks.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  <span>{item.title}</span>
                  <ArrowRight
                    className="size-4 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
