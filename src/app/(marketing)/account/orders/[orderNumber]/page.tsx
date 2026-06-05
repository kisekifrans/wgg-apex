import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { OrderLookupCard } from "@/components/orders/order-lookup-card";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/lib/auth/session";
import { getCustomerOrderByNumber } from "@/lib/db/public-orders";

type PageProps = {
  params: Promise<{ orderNumber: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { orderNumber } = await params;
  return { title: `Order ${orderNumber}` };
}

export default async function AccountOrderDetailPage({ params }: PageProps) {
  const session = await getSessionUser();

  if (!session?.email) {
    redirect("/account/login");
  }

  const { orderNumber } = await params;
  const order = await getCustomerOrderByNumber(session.email, orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 pb-24 pt-28 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-8 text-muted-foreground"
        render={<Link href="/account" />}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        All orders
      </Button>

      <OrderLookupCard order={order} />
    </div>
  );
}
