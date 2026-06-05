import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";

import { CustomerOrdersList } from "@/components/account/customer-orders-list";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/session";
import { listCustomerOrders } from "@/lib/db/public-orders";

export const metadata = {
  title: "My Orders",
  description: "View your WGG Apex order history and status.",
};

export default async function AccountPage() {
  const session = await getSessionUser();

  if (!session?.email) {
    redirect("/account/login");
  }

  const orders = await listCustomerOrders(session.email);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 pb-24 pt-28 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-8 text-muted-foreground"
        render={<Link href="/" />}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to home
      </Button>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-[var(--brand-gold)]">
            Customer account
          </p>
          <h1 className="font-heading mt-2 text-3xl font-semibold tracking-tight">
            My Orders
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{session.email}</p>
        </div>
        <SignOutButton
          variant="outline"
          size="sm"
          className="border-white/10"
          redirectTo="/account/login"
        >
          <LogOut className="size-4" data-icon="inline-start" />
          Sign out
        </SignOutButton>
      </header>

      <CustomerOrdersList orders={orders} />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Need a one-off lookup without signing in?{" "}
        <Link href="/track-order" className="text-primary hover:underline">
          Track order
        </Link>
      </p>
    </div>
  );
}
