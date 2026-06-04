import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { OrderForm } from "@/components/admin/orders/order-form";
import { Button } from "@/components/ui/button";
import { ORDER_TYPE_LABELS } from "@/config/orders";
import { getServiceOrderById } from "@/lib/db/service-orders";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const order = await getServiceOrderById(id).catch(() => null);
  return {
    title: order ? order.orderNumber : "Order",
  };
}

export default async function EditOrderPage({ params }: PageProps) {
  const { id } = await params;

  let order: Awaited<ReturnType<typeof getServiceOrderById>> = null;
  let error: string | null = null;

  try {
    order = await getServiceOrderById(id);
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Failed to load order. Run Supabase migrations.";
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        render={<Link href="/admin/orders" />}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to orders
      </Button>

      <div>
        <p className="font-mono text-xs text-muted-foreground">
          {order.orderNumber}
        </p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {ORDER_TYPE_LABELS[order.orderType]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {order.customerDiscord}
        </p>
      </div>

      <OrderForm mode="edit" order={order} />
    </div>
  );
}
