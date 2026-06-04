"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ORDER_PAYMENT_STATUS_LABELS,
  ORDER_TYPE_LABELS,
} from "@/config/orders";
import {
  SERVICE_ORDER_PAYMENT_STATUSES,
  SERVICE_ORDER_TYPES,
} from "@/types/orders";

export function OrdersFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const paymentStatus = searchParams.get("paymentStatus") ?? "all";
  const orderType = searchParams.get("orderType") ?? "all";

  const hasFilters =
    !!q ||
    paymentStatus !== "all" ||
    orderType !== "all" ||
    !!searchParams.get("status");

  const applyFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      startTransition(() => {
        router.push(`/admin/orders?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  function clearFilters() {
    startTransition(() => {
      router.push("/admin/orders");
    });
  }

  return (
    <form
      className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-4 backdrop-blur-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        applyFilters({
          q: String(formData.get("q") ?? ""),
          paymentStatus: String(formData.get("paymentStatus") ?? "all"),
          orderType: String(formData.get("orderType") ?? "all"),
        });
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-foreground">Search & filters</h2>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground"
            disabled={pending}
            onClick={clearFilters}
          >
            <X className="size-3.5" data-icon="inline-start" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="q">Search orders</Label>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              name="q"
              placeholder="Order #, Discord, email, rank, notes…"
              defaultValue={q}
              key={`q-${q}`}
              className="border-white/10 bg-background/50 pl-9"
              disabled={pending}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Payment</Label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            defaultValue={paymentStatus}
            className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
            disabled={pending}
          >
            <option value="all">All payments</option>
            {SERVICE_ORDER_PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_PAYMENT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="orderType">Service type</Label>
          <select
            id="orderType"
            name="orderType"
            defaultValue={orderType}
            className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
            disabled={pending}
          >
            <option value="all">All types</option>
            {SERVICE_ORDER_TYPES.map((t) => (
              <option key={t} value={t}>
                {ORDER_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button
        type="submit"
        size="sm"
        variant="outline"
        className="border-white/10"
        disabled={pending}
      >
        Apply filters
      </Button>
    </form>
  );
}
