import "server-only";

const BUCKET = "marketplace-listings";

export function getMarketplaceImagePublicUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "";
  return `${url}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

export function buildListingImagePath(
  listingId: string,
  fileName: string
): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ["jpeg", "jpg", "png", "webp", "gif"].includes(ext)
    ? ext === "jpeg"
      ? "jpg"
      : ext
    : "jpg";
  return `${listingId}/${crypto.randomUUID()}.${safeExt}`;
}

export { BUCKET as MARKETPLACE_BUCKET };
