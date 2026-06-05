import { MarketingFooter } from "@/components/layout/marketing-footer";
import { MarketingHashScroll } from "@/components/layout/marketing-hash-scroll";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingPageBackground } from "@/components/marketing/marketing-page-background";
import { getSessionUser } from "@/lib/auth/session";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();

  return (
    <div className="relative min-h-screen">
      <MarketingPageBackground />
      <MarketingHashScroll />
      <MarketingHeader isSignedIn={Boolean(session)} />
      <main className="relative z-0 flex-1 pt-24">{children}</main>
      <MarketingFooter />
    </div>
  );
}
