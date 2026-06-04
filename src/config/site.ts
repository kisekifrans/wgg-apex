import { brandAssets } from "@/config/brand-assets";

export const siteConfig = {
  name: "WGG Apex",
  tagline: "Premium Apex Legends services",
  description:
    "Ranked boosting, Predator maintenance, badges, unban support, and verified accounts—for players who want legit operators, clear pricing, and live order tracking.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://wggapex.com",
  supportEmail: "support@wggapex.com",
  brand: {
    logoSrc: brandAssets.logo,
    heroSrc: brandAssets.brandHero,
  },
} as const;
