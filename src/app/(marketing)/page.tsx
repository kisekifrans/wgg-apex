import { BadgeServicesSection } from "@/components/marketing/badge-services-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { CustomerProcessSection } from "@/components/marketing/customer-process-section";
import { DiscordCommunitySection } from "@/components/marketing/discord-community-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeaturedAccountsSection } from "@/components/marketing/featured-accounts-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { RankPricingSection } from "@/components/marketing/rank-pricing-section";
import { ServicesOverviewSection } from "@/components/marketing/services-overview-section";
import { UnbanServiceSection } from "@/components/marketing/unban-service-section";
import { WhyChooseSection } from "@/components/marketing/why-choose-section";
import { getPublicServicesCatalog } from "@/lib/db/services-catalog";

export default async function HomePage() {
  let catalog: Awaited<ReturnType<typeof getPublicServicesCatalog>> | null =
    null;

  try {
    catalog = await getPublicServicesCatalog();
  } catch {
    catalog = null;
  }

  return (
    <>
      <HeroSection />
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
      <CustomerProcessSection />
      <FaqSection />
      <DiscordCommunitySection />
      <CtaSection />
    </>
  );
}
