import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PricingItemsEditor } from "@/components/admin/services/pricing-items-editor";
import { ServiceForm } from "@/components/admin/services/service-form";
import { Button } from "@/components/ui/button";
import { formatOrderAmount } from "@/lib/orders/format";
import { getServiceById } from "@/lib/db/services-catalog";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const service = await getServiceById(id).catch(() => null);
  return { title: service?.name ?? "Edit service" };
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params;

  let service: Awaited<ReturnType<typeof getServiceById>> = null;
  let error: string | null = null;

  try {
    service = await getServiceById(id);
  } catch (e) {
    error =
      e instanceof Error
        ? e.message
        : "Failed to load service. Run Supabase migrations.";
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 text-muted-foreground"
        render={<Link href="/admin/services" />}
      >
        <ArrowLeft className="size-4" data-icon="inline-start" />
        Back to services
      </Button>

      <div>
        <p className="font-mono text-xs text-muted-foreground">/{service.slug}</p>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {service.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          From price on site:{" "}
          <span className="font-mono font-medium text-primary">
            {service.fromPriceCents != null
              ? formatOrderAmount(service.fromPriceCents)
              : service.priceLabel ?? "—"}
          </span>
        </p>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <ServiceForm mode="edit" service={service} />
        <PricingItemsEditor service={service} />
      </div>
    </div>
  );
}
