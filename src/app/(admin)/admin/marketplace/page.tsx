import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PagePlaceholder } from "@/components/admin/page-placeholder";

export const metadata = {
  title: "Account Marketplace",
};

export default function AdminMarketplacePage() {
  return (
    <>
      <AdminPageHeader
        title="Account Marketplace"
        description="Verify, publish, and manage account listings with disclosed rank, RP, and pricing."
      />
      <PagePlaceholder
        title="Marketplace listings coming soon"
        description="Operators will draft listings, set prices, verify accounts, and feature listings on the homepage."
      />
    </>
  );
}
