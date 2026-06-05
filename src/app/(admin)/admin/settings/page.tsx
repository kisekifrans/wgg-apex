import { LogOut } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PagePlaceholder } from "@/components/admin/page-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getAdminUser } from "@/lib/auth/session";

export const metadata = {
  title: "Settings",
};

export default async function AdminSettingsPage() {
  const user = await getAdminUser();
  const { isConfigured } = getSupabaseEnv();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Platform configuration and your admin account details."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Your account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span className="truncate font-medium">{user?.email ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize">
                {user?.role.replace("_", " ") ?? "—"}
              </span>
            </div>
            <SignOutButton
              variant="outline"
              size="sm"
              className="mt-4 w-full border-white/10"
              redirectTo="/login"
            >
              <LogOut className="size-4" data-icon="inline-start" />
              Sign out
            </SignOutButton>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="font-heading text-lg">System</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Supabase</span>
              <span
                className={
                  isConfigured ? "text-primary" : "text-destructive"
                }
              >
                {isConfigured ? "Connected" : "Not configured"}
              </span>
            </div>
            <p className="text-muted-foreground">
              Add <code className="text-xs">ADMIN_EMAILS</code> or set{" "}
              <code className="text-xs">profiles.role</code> to admin for access.
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <PagePlaceholder
            title="General settings coming soon"
            description="Business name, support email, notification templates, and PayPal configuration."
          />
        </div>
      </div>
    </>
  );
}
