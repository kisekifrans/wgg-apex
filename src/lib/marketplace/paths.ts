export function marketplaceListingPath(listing: {
  listingNumber: string;
}): string {
  return `/marketplace/${encodeURIComponent(listing.listingNumber)}`;
}

export function marketplaceCheckoutPath(listing: {
  listingNumber: string;
}): string {
  return `/checkout/marketplace/${encodeURIComponent(listing.listingNumber)}`;
}
