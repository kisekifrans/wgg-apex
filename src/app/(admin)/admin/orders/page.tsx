import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";

import { PendingCheckoutsPanel } from "@/components/admin/checkout/pending-checkouts-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersDashboard } from "@/components/admin/orders/orders-dashboard";
import { OrdersFilters } from "@/components/admin/orders/orders-filters";
import { OrdersRevenueStats } from "@/components/admin/orders/orders-revenue-stats";
import { OrdersStatusPills } from "@/components/admin/orders/orders-status-pills";
import { Button } from "@/components/ui/button";
import { getPendingStripeCheckouts } from "@/lib/db/checkout";
import {
  getAdminServiceOrders,
  getServiceOrderRevenueMetrics,
  sumOrderRevenue,
} from "@/lib/db/service-orders";
import type { ServiceOrderFilters } from "@/types/orders";

export const metadata = {
  title: "Orders",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    paymentStatus?: string;
    orderType?: string;
  }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: ServiceOrderFilters = {
    q: params.q,
    status: (params.status as ServiceOrderFilters["status"]) ?? "all",
    paymentStatus:
      (params.paymentStatus as ServiceOrderFilters["paymentStatus"]) ?? "all",
    orderType: (params.orderType as ServiceOrderFilters["orderType"]) ?? "all",
  };

  const hasActiveFilters =
    !!filters.q ||
    (filters.status && filters.status !== "all") ||
    (filters.paymentStatus && filters.paymentStatus !== "all") ||
    (filters.orderType && filters.orderType !== "all");

  let orders: Awaited<ReturnType<typeof getAdminServiceOrders>> = [];
  let pendingCheckouts: Awaited<ReturnType<typeof getPendingStripeCheckouts>> =
    [];
  let revenueMetrics: Awaited<
    ReturnType<typeof getServiceOrderRevenueMetrics>
  > | null = null;
  let error: string | null = null;

  try {
    const [ordersData, metrics, pending] = await Promise.all([
      getAdminServiceOrders(filters),
      getServiceOrderRevenueMetrics(),
      getPendingStripeCheckouts(),
    ]);
    orders = ordersData;
    revenueMetrics = metrics;
    pendingCheckouts = pending;
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Failed to load orders. Run Supabase migrations.";
  }

  const filteredPaidCents = sumOrderRevenue(orders);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Fulfillment queue, customer contacts, and revenue across all service lines."
      >
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
          render={<Link href="/admin/orders/new" />}
        >
          <Plus className="size-4" data-icon="inline-start" />
          New order
        </Button>
      </AdminPageHeader>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <PendingCheckoutsPanel checkouts={pendingCheckouts} />

          {revenueMetrics && (
            <OrdersRevenueStats
              metrics={revenueMetrics}
              filteredPaidCents={filteredPaidCents}
              filteredCount={orders.length}
              hasActiveFilters={!!hasActiveFilters}
            />
          )}

          <div className="space-y-3">
            <Suspense fallback={<PillsSkeleton />}>
              <OrdersStatusPills />
            </Suspense>
            <Suspense fallback={<FiltersSkeleton />}>
              <OrdersFilters />
            </Suspense>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{orders.length}</span>{" "}
              order{orders.length === 1 ? "" : "s"}
              {filters.status && filters.status !== "all" && (
                <span> · {filters.status.replace(/_/g, " ")}</span>
              )}
            </p>
          </div>

          <OrdersDashboard orders={orders} />
        </>
      )}
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="h-[140px] animate-pulse rounded-xl border border-white/5 bg-card/40" />
  );
}

function PillsSkeleton() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-8 w-20 animate-pulse rounded-full border border-white/5 bg-card/40"
        />
      ))}
    </div>
  );
}
