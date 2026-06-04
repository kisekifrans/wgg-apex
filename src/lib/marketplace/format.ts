export function formatListingPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function centsToDisplayDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}
