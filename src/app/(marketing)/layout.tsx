import { MarketingFooter } from "@/components/layout/marketing-footer";
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
    <div className="relative isolate">
      <MarketingPageBackground />
      <MarketingHeader isSignedIn={Boolean(session)} />
      <main className="relative flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
