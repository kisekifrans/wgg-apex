"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Pencil,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import {
  reorderServices,
  toggleServiceFeatured,
  toggleServiceVisibility,
} from "@/actions/admin/services/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRICING_ENGINE_LABELS } from "@/config/services";
import { formatOrderAmount } from "@/lib/orders/format";
import { getServiceIcon } from "@/lib/services/icons";
import { cn } from "@/lib/utils";
import type { CatalogService } from "@/types/services";

export function ServicesList({ services }: { services: CatalogService[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function moveService(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;

    const ordered = [...services];
    const [removed] = ordered.splice(index, 1);
    ordered.splice(target, 0, removed);

    startTransition(async () => {
      const result = await reorderServices(ordered.map((s) => s.id));
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Order updated");
      router.refresh();
    });
  }

  function toggleFeatured(service: CatalogService) {
    startTransition(async () => {
      const result = await toggleServiceFeatured(
        service.id,
        !service.isFeatured
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        service.isFeatured
          ? "Removed from homepage featured"
          : "Set as homepage featured"
      );
      router.refresh();
    });
  }

  function toggleVisibility(service: CatalogService) {
    startTransition(async () => {
      const result = await toggleServiceVisibility(
        service.id,
        !service.isActive
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(service.isActive ? "Service hidden" : "Service visible");
      router.refresh();
    });
  }

  if (services.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-card/30 px-6 py-16 text-center">
        <p className="font-medium">No services yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your first service to power the marketing site pricing.
        </p>
      </div>
    );
  }

  return (
    <ul
      className={cn(
        "space-y-3",
        pending && "pointer-events-none opacity-60"
      )}
    >
      {services.map((service, index) => {
        const Icon = getServiceIcon(service.icon);
        const priceDisplay =
          service.fromPriceCents != null
            ? `From ${formatOrderAmount(service.fromPriceCents)}${service.priceLabel ?? ""}`
            : (service.priceLabel ?? "—");

        return (
          <li
            key={service.id}
            className={cn(
              "flex flex-col gap-4 rounded-xl border border-white/5 bg-card/40 p-4 sm:flex-row sm:items-center",
              !service.isActive && "opacity-60"
            )}
          >
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary">
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{service.name}</h3>
                  {service.isFeatured && (
                    <Badge className="border-primary/30 bg-primary/15 text-primary hover:bg-primary/15">
                      Featured
                    </Badge>
                  )}
                  {!service.isActive && (
                    <Badge variant="outline" className="border-white/10 text-muted-foreground">
                      Hidden
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-white/10 font-normal text-muted-foreground">
                    {PRICING_ENGINE_LABELS[service.pricingEngine]}
                  </Badge>
                </div>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  /{service.slug}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {priceDisplay} · {service.pricingItems.length} pricing
                  {service.pricingItems.length === 1 ? " row" : " rows"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1 self-end sm:self-center">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={pending || !service.isActive}
                onClick={() => toggleFeatured(service)}
                aria-label={
                  service.isFeatured
                    ? "Remove homepage featured"
                    : "Set as homepage featured"
                }
                className={cn(
                  service.isFeatured && "text-primary"
                )}
              >
                <Star
                  className={cn(
                    "size-4",
                    service.isFeatured && "fill-primary"
                  )}
                  aria-hidden
                />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === 0 || pending}
                onClick={() => moveService(index, -1)}
                aria-label="Move up"
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={index === services.length - 1 || pending}
                onClick={() => moveService(index, 1)}
                aria-label="Move down"
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={pending}
                onClick={() => toggleVisibility(service)}
                aria-label={service.isActive ? "Hide service" : "Show service"}
              >
                {service.isActive ? (
                  <Eye className="size-4" />
                ) : (
                  <EyeOff className="size-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/10"
                render={<Link href={`/admin/services/${service.id}`} />}
              >
                <Pencil className="size-3.5" data-icon="inline-start" />
                Edit
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
