"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";

import { lookupOrder } from "@/actions/orders/lookup-order";
import { OrderLookupCard } from "@/components/orders/order-lookup-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PublicOrderSnapshot } from "@/types/public-order";

type LookupMethod = "email" | "discord";

type TrackOrderFormProps = {
  initialOrderNumber?: string;
};

export function TrackOrderForm({ initialOrderNumber = "" }: TrackOrderFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PublicOrderSnapshot | null>(null);
  const [method, setMethod] = useState<LookupMethod>("email");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    const formData = new FormData(e.currentTarget);
    const orderNumber = String(formData.get("orderNumber") ?? "");

    const result =
      method === "email"
        ? await lookupOrder({
            method: "email",
            orderNumber,
            email: String(formData.get("email") ?? ""),
          })
        : await lookupOrder({
            method: "discord",
            orderNumber,
            discord: String(formData.get("discord") ?? ""),
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
        <div className="flex rounded-lg border border-white/10 bg-background/30 p-1">
          {(["email", "discord"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMethod(value);
                setError(null);
                setOrder(null);
              }}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                method === value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {value === "email" ? "Email" : "Discord"}
            </button>
          ))}
        </div>

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

        {method === "email" ? (
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
              Must match the email used at checkout.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="discord">Discord username</Label>
            <Input
              id="discord"
              name="discord"
              required
              placeholder="username"
              className="border-white/10 bg-background/50"
            />
            <p className="text-xs text-muted-foreground">
              Must match the Discord handle entered at checkout (without @).
            </p>
          </div>
        )}

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

        <p className="text-center text-xs text-muted-foreground">
          Have multiple orders?{" "}
          <Link href="/account/login" className="text-primary hover:underline">
            Sign in to see them all
          </Link>
        </p>
      </form>

      {order ? <OrderLookupCard order={order} /> : null}
    </div>
  );
}
