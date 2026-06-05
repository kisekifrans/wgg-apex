import { ContentCmsPanel } from "@/components/admin/content/content-cms-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminCompletedBoosts } from "@/lib/db/completed-boosts";
import { getAdminCustomerReviews } from "@/lib/db/customer-reviews";
import {
  getDiscordWebhookSettings,
  type DiscordWebhookSettings,
} from "@/lib/db/app-settings";

export const metadata = { title: "Content" };

export default async function AdminContentPage() {
  const [reviews, boosts, discordSettings] = await Promise.all([
    getAdminCustomerReviews().catch(() => []),
    getAdminCompletedBoosts().catch(() => []),
    getDiscordWebhookSettings().catch(
      () => ({}) as DiscordWebhookSettings
    ),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Homepage content"
        description="Manage customer reviews, completed boost gallery, and Discord sold-listing webhook."
      />
      <ContentCmsPanel
        reviews={reviews}
        boosts={boosts}
        soldWebhookUrl={discordSettings.soldWebhookUrl ?? ""}
      />
    </>
  );
}
