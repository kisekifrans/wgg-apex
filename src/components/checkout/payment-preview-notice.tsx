type PaymentPreviewNoticeProps = {
  className?: string;
};

/** Shown when forms are visible but PayPal credentials are not set (preview / UX review). */
export function PaymentPreviewNotice({ className }: PaymentPreviewNoticeProps) {
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
        checkout, add PayPal sandbox credentials to{" "}
        <span className="font-mono text-xs">.env.local</span> (see{" "}
        <span className="font-mono text-xs">.env.example</span>).
      </p>
    </div>
  );
}
