import { BadgeServicesSection } from "@/components/marketing/badge-services-section";
import { CtaSection } from "@/components/marketing/cta-section";
import { CustomerProcessSection } from "@/components/marketing/customer-process-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeaturedAccountsSection } from "@/components/marketing/featured-accounts-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { RankPricingSection } from "@/components/marketing/rank-pricing-section";
import { ServicesOverviewSection } from "@/components/marketing/services-overview-section";
import { UnbanServiceSection } from "@/components/marketing/unban-service-section";
import { WhyChooseSection } from "@/components/marketing/why-choose-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyChooseSection />
      <ServicesOverviewSection />
      <RankPricingSection />
      <BadgeServicesSection />
      <UnbanServiceSection />
      <FeaturedAccountsSection />
      <CustomerProcessSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
