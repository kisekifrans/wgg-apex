/**
 * Fixed full-page backdrop for marketing routes — mesh, aurora, grid, vignette.
 */
export function MarketingPageBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-marketing-base" />

      <div className="marketing-aurora marketing-aurora-orange" />
      <div className="marketing-aurora marketing-aurora-red" />
      <div className="marketing-aurora marketing-aurora-gold" />

      <div className="absolute inset-0 bg-marketing-grid" />
      <div className="absolute inset-0 bg-marketing-beam" />
      <div className="absolute inset-0 bg-marketing-vignette" />
      <div className="absolute inset-0 marketing-grain" />
    </div>
  );
}
