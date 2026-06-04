export const MAX_LISTING_IMAGES = 10;
export const MAX_LISTING_IMAGE_BYTES = 5 * 1024 * 1024;

export const LISTING_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif";

export const MARKETPLACE_BUCKET = "marketplace-listings";

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
