import "server-only";

import { MARKETPLACE_BUCKET } from "@/lib/marketplace/images";

export function getMarketplaceImagePublicUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return `${url}/storage/v1/object/public/${MARKETPLACE_BUCKET}/${storagePath}`;
}

export { MARKETPLACE_BUCKET, buildListingImagePath } from "@/lib/marketplace/images";
