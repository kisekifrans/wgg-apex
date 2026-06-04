import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PagePlaceholder } from "@/components/admin/page-placeholder";

export const metadata = {
  title: "Services",
};

export default function AdminServicesPage() {
  return (
    <>
      <AdminPageHeader
        title="Services"
        description="Edit catalog, pricing engines, tiers, badge SKUs, and Predator plans from one hub."
      />
      <PagePlaceholder
        title="Services management coming soon"
        description="Database-driven service editors per pricing engine (tier matrix, catalog items, subscription plans, flat fees)."
      />
    </>
  );
}
