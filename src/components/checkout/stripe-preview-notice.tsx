type StripePreviewNoticeProps = {
  className?: string;
};

/** Shown when forms are visible but STRIPE_SECRET_KEY is not set (preview / UX review). */
export function StripePreviewNotice({ className }: StripePreviewNoticeProps) {
  return (
    <div
      className={
        className ??
        "rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-50/90"
      }
    >
      <p className="font-medium text-amber-100">Preview mode — payments disabled</p>
      <p className="mt-1 text-amber-50/80">
        You can fill out the form and review the layout. To complete a test
        checkout, add a Stripe{" "}
        <span className="font-mono text-xs">sk_test_…</span> key to{" "}
        <span className="font-mono text-xs">.env.local</span> (see guide below).
      </p>
    </div>
  );
}
