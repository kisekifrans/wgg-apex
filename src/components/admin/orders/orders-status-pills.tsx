"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { ORDER_STATUS_LABELS } from "@/config/orders";
import { cn } from "@/lib/utils";
import { SERVICE_ORDER_STATUSES, type ServiceOrderStatus } from "@/types/orders";

const pillStyles: Record<ServiceOrderStatus | "all", string> = {
  all: "border-white/10 bg-white/5 text-foreground hover:border-white/20",
  pending: "border-white/10 bg-white/5 text-muted-foreground data-[active=true]:border-white/25 data-[active=true]:bg-white/10 data-[active=true]:text-foreground",
  paid: "border-primary/20 bg-primary/5 text-primary/90 data-[active=true]:border-primary/40 data-[active=true]:bg-primary/15",
  in_progress:
    "border-amber-500/20 bg-amber-500/5 text-amber-200/80 data-[active=true]:border-amber-500/40 data-[active=true]:bg-amber-500/15",
  completed:
    "border-emerald-500/20 bg-emerald-500/5 text-emerald-200/80 data-[active=true]:border-emerald-500/40 data-[active=true]:bg-emerald-500/15",
  cancelled:
    "border-destructive/20 bg-destructive/5 text-destructive/90 data-[active=true]:border-destructive/40 data-[active=true]:bg-destructive/15",
};

export function OrdersStatusPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = searchParams.get("status") ?? "all";

  function setStatus(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    startTransition(() => {
      router.push(`/admin/orders?${params.toString()}`);
    });
  }

  const pills: { value: string; label: string }[] = [
    { value: "all", label: "All" },
    ...SERVICE_ORDER_STATUSES.map((s) => ({
      value: s,
      label: ORDER_STATUS_LABELS[s],
    })),
  ];

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        pending && "pointer-events-none opacity-60"
      )}
    >
      {pills.map((pill) => (
        <button
          key={pill.value}
          type="button"
          data-active={current === pill.value}
          onClick={() => setStatus(pill.value)}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            pillStyles[pill.value as ServiceOrderStatus | "all"]
          )}
        >
          {pill.label}
        </button>
      ))}
    </div>
  );
}
