"use client";

import { useState } from "react";
import { Loader2, Search } from "lucide-react";

import { lookupOrder } from "@/actions/orders/lookup-order";
import { OrderLookupCard } from "@/components/orders/order-lookup-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PublicOrderSnapshot } from "@/types/public-order";

type TrackOrderFormProps = {
  initialOrderNumber?: string;
};

export function TrackOrderForm({ initialOrderNumber = "" }: TrackOrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PublicOrderSnapshot | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    const formData = new FormData(e.currentTarget);
    const result = await lookupOrder({
      orderNumber: String(formData.get("orderNumber") ?? ""),
      email: String(formData.get("email") ?? ""),
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOrder(result.order);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-white/5 bg-card/40 p-6 sm:p-8"
      >
        <div className="space-y-2">
          <Label htmlFor="orderNumber">Order number</Label>
          <Input
            id="orderNumber"
            name="orderNumber"
            required
            placeholder="WGG-2026-00001"
            defaultValue={initialOrderNumber}
            className="border-white/10 bg-background/50 font-mono"
          />
          <p className="text-xs text-muted-foreground">
            From your checkout confirmation or success page.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            className="border-white/10 bg-background/50"
          />
          <p className="text-xs text-muted-foreground">
            Must match the email used at checkout (receipt or intake form).
          </p>
        </div>

        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Search className="size-4" data-icon="inline-start" />
          )}
          Look Up Order
        </Button>
      </form>

      {order ? <OrderLookupCard order={order} /> : null}
    </div>
  );
}
