import { getBrandLogoDataUrl, renderBrandIcon } from "@/lib/brand/icon-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logoSrc = await getBrandLogoDataUrl();
  return renderBrandIcon(180, logoSrc);
}
