import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PagePlaceholder } from "@/components/admin/page-placeholder";

export const metadata = {
  title: "Discord Tools",
};

export default function AdminDiscordPage() {
  return (
    <>
      <AdminPageHeader
        title="Discord Tools"
        description="Configure webhooks, order notifications, and support channel integrations."
      />
      <PagePlaceholder
        title="Discord integrations coming soon"
        description="Connect a Discord bot or webhook URLs for order alerts, status updates, and operator workflows."
      />
    </>
  );
}
