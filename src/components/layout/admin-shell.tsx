import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopBar } from "@/components/layout/admin-top-bar";
import type { AdminUser } from "@/types/auth";

type AdminShellProps = {
  user: AdminUser;
  title?: string;
  description?: string;
  children: React.ReactNode;
};

export function AdminShell({
  user,
  title,
  description,
  children,
}: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar user={user} title={title} description={description} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
