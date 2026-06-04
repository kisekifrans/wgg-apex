import { getBrandLogoDataUrl, renderBrandIcon } from "@/lib/brand/icon-image";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const logoSrc = await getBrandLogoDataUrl();
  return renderBrandIcon(32, logoSrc);
}
