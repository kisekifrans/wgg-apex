import { MarketingPageBackground } from "@/components/marketing/marketing-page-background";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative isolate flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <MarketingPageBackground />
      <div className="relative z-10 flex w-full flex-col items-center">
        {children}
      </div>
    </div>
  );
}
