import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PagePlaceholder } from "@/components/admin/page-placeholder";

export const metadata = {
  title: "Orders",
};

export default function AdminOrdersPage() {
  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Manage the fulfillment queue, update statuses, and communicate with customers."
      />
      <PagePlaceholder
        title="Order queue coming soon"
        description="This module will list paid, in-progress, and completed orders with filters, search, and inline status updates."
      />
    </>
  );
}
