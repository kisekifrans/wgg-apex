import "server-only";

import { brandAssets } from "@/config/brand-assets";
import { getSiteUrl } from "@/lib/site-url";

export type EmailBrandUrls = {
  siteUrl: string;
  logoUrl: string;
  heroUrl: string;
};

/** Absolute URLs for images in HTML email (required by mail clients). */
export function getEmailBrandUrls(): EmailBrandUrls {
  const siteUrl = getSiteUrl();
  return {
    siteUrl,
    logoUrl: `${siteUrl}${brandAssets.logo}`,
    heroUrl: `${siteUrl}${brandAssets.brandHero}`,
  };
}
