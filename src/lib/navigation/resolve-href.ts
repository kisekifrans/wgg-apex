/** Hash section links work on `/`; on other routes prefix with `/`. */
export function resolveMarketingHref(
  href: string,
  pathname: string
): string {
  if (href.startsWith("#") && pathname !== "/") {
    return `/${href}`;
  }
  return href;
}
