import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { OrderForm } from "@/components/admin/orders/order-form";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "New order",
};

export default function NewOrderPage() {
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
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Create service order
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Capture Discord contact, ranks, notes, and fulfillment status.
        </p>
      </div>

      <OrderForm mode="create" />
    </div>
  );
}
