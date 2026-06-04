export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-brand-glow"
        aria-hidden
      />
      <div className="relative z-10 flex w-full flex-col items-center">
        {children}
      </div>
    </div>
  );
}
