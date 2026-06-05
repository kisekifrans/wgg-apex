import { BadgeServicesSection } from "@/components/marketing/badge-services-section";
import { PromoSection } from "@/components/marketing/promo-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { CustomerProcessSection } from "@/components/marketing/customer-process-section";
import { DiscordCommunitySection } from "@/components/marketing/discord-community-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeaturedAccountsSection } from "@/components/marketing/featured-accounts-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { RankPricingSection } from "@/components/marketing/rank-pricing-section";
import { getRecentPublicHeroOrders } from "@/lib/db/public-orders";
import {
  buildHeroDashboardPreview,
  HERO_ORDER_PREVIEW_FALLBACK,
} from "@/lib/orders/public-display";
import { ServicesOverviewSection } from "@/components/marketing/services-overview-section";
import { UnbanServiceSection } from "@/components/marketing/unban-service-section";
import { CompletedBoostsSection } from "@/components/marketing/completed-boosts-section";
import { ReviewsSection } from "@/components/marketing/reviews-section";
import { WhyChooseSection } from "@/components/marketing/why-choose-section";
import { getPublicCompletedBoosts } from "@/lib/db/completed-boosts";
import { getPublicCustomerReviews } from "@/lib/db/customer-reviews";
import { getFeaturedPromos } from "@/lib/db/promo-codes";
import { getPublicServicesCatalog } from "@/lib/db/services-catalog";

export default async function HomePage() {
  let catalog: Awaited<ReturnType<typeof getPublicServicesCatalog>> | null =
    null;

  try {
    catalog = await getPublicServicesCatalog();
  } catch {
    catalog = null;
  }

  let orderPreview = HERO_ORDER_PREVIEW_FALLBACK;
  try {
    const recentOrders = await getRecentPublicHeroOrders(5);
    orderPreview = buildHeroDashboardPreview(recentOrders);
  } catch {
    orderPreview = HERO_ORDER_PREVIEW_FALLBACK;
  }

  const [reviews, completedBoosts, featuredPromos] = await Promise.all([
    getPublicCustomerReviews().catch(() => []),
    getPublicCompletedBoosts().catch(() => []),
    getFeaturedPromos().catch(() => []),
  ]);

  return (
    <>
      <HeroSection orderPreview={orderPreview} />
      <PromoSection promos={featuredPromos} />
      <WhyChooseSection />
      {catalog ? (
        <>
          <ServicesOverviewSection
            featuredService={catalog.featuredService}
            services={catalog.overview}
          />
          <RankPricingSection
            rankedBoost={catalog.rankedBoost}
            selfPlayBoost={catalog.selfPlayBoost}
            predatorMaintenance={catalog.predatorMaintenance}
          />
          <BadgeServicesSection badgeBoosting={catalog.badgeBoosting} />
          <UnbanServiceSection unbanService={catalog.unbanService} />
        </>
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-12 text-center text-sm text-muted-foreground">
          Pricing catalog unavailable. Apply database migrations to load services.
        </div>
      )}
      <FeaturedAccountsSection />
      <CompletedBoostsSection boosts={completedBoosts} />
      <ReviewsSection reviews={reviews} />
      <CustomerProcessSection />
      <FaqSection />
      <DiscordCommunitySection />
      <CtaSection />
    </>
  );
}
