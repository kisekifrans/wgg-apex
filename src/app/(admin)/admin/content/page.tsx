import { ContentCmsPanel } from "@/components/admin/content/content-cms-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminCompletedBoosts } from "@/lib/db/completed-boosts";
import { getAdminCustomerReviews } from "@/lib/db/customer-reviews";
import {
  getDiscordWebhookSettings,
  type DiscordWebhookSettings,
} from "@/lib/db/app-settings";
import { getAdminPromoCodes } from "@/lib/db/promo-codes";

export const metadata = { title: "Content" };

export default async function AdminContentPage() {
  const [reviews, boosts, discordSettings, promos] = await Promise.all([
    getAdminCustomerReviews().catch(() => []),
    getAdminCompletedBoosts().catch(() => []),
    getDiscordWebhookSettings().catch(
      () => ({}) as DiscordWebhookSettings
    ),
    getAdminPromoCodes().catch(() => []),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Homepage content"
        description="Manage reviews, boosts, promo codes, and Discord webhooks."
      />
      <ContentCmsPanel
        reviews={reviews}
        boosts={boosts}
        soldWebhookUrl={discordSettings.soldWebhookUrl ?? ""}
        ordersWebhookUrl={discordSettings.ordersWebhookUrl ?? ""}
        promos={promos}
      />
    </>
  );
}
