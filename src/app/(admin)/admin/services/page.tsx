import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ServicesList } from "@/components/admin/services/services-list";
import { Button } from "@/components/ui/button";
import { getAdminServices } from "@/lib/db/services-catalog";

export const metadata = {
  title: "Services & Pricing",
};

export default async function AdminServicesPage() {
  let services: Awaited<ReturnType<typeof getAdminServices>> = [];
  let error: string | null = null;

  try {
    services = await getAdminServices();
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Failed to load services. Run Supabase migrations.";
  }

  return (
    <>
      <AdminPageHeader
        title="Services & pricing"
        description="Manage catalog visibility, order, and prices. The marketing site reads from this database—no deploy needed for price changes."
      >
        <Button
          size="sm"
          className="bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
          render={<Link href="/admin/services/new" />}
        >
          <Plus className="size-4" data-icon="inline-start" />
          Add service
        </Button>
      </AdminPageHeader>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : (
        <ServicesList services={services} />
      )}
    </>
  );
}
