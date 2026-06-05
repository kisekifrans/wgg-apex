/** Hash section links work on `/`; on other routes prefix with `/`. */
export function resolveMarketingHref(
  href: string,
  pathname: string
): string {
  if (href.startsWith("#")) {
    return pathname === "/" ? href : `/${href}`;
  }
  return href;
}

export function scrollToMarketingHash(hash: string): void {
  const id = hash.replace(/^#/, "");
  if (!id) return;

  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
