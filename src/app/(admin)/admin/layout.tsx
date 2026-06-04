import { requireAdmin } from "@/lib/auth/guards";
import { AdminShell } from "@/components/layout/admin-shell";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <TooltipProvider>
      <AdminShell user={user}>{children}</AdminShell>
      <Toaster position="top-right" theme="dark" />
    </TooltipProvider>
  );
}
