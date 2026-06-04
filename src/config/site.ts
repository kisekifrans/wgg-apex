import { brandAssets } from "@/config/brand-assets";

export const siteConfig = {
  name: "WGG Apex",
  tagline: "Premium Apex Legends services platform",
  description:
    "Ranked boosting, Predator maintenance, badges, unban support, and verified accounts—for competitive Apex players who expect SaaS-grade trust and clarity.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wggapex.com",
  supportEmail: "support@wggapex.com",
  brand: {
    logoSrc: brandAssets.logo,
    heroSrc: brandAssets.brandHero,
  },
} as const;
