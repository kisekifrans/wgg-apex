"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useCallback, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MARKETPLACE_PLATFORMS,
  MARKETPLACE_STATUSES,
} from "@/types/marketplace";

export function MarketplaceFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";
  const platform = searchParams.get("platform") ?? "all";

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
        router.push(`/admin/marketplace?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <form
      className="grid gap-4 rounded-xl border border-white/5 bg-card/40 p-4 sm:grid-cols-2 lg:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        applyFilters({
          q: String(formData.get("q") ?? ""),
          status: String(formData.get("status") ?? "all"),
          platform: String(formData.get("platform") ?? "all"),
        });
      }}
    >
      <div className="space-y-2 sm:col-span-2 lg:col-span-2">
        <Label htmlFor="q">Search</Label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Title, rank, listing #…"
            className="border-white/10 bg-background/50 pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">All statuses</option>
          {MARKETPLACE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="platform">Platform</Label>
        <select
          id="platform"
          name="platform"
          defaultValue={platform}
          className="flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">All platforms</option>
          {MARKETPLACE_PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
          disabled={isPending}
        >
          {isPending ? "Filtering…" : "Apply filters"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-white/10"
          disabled={isPending}
          onClick={() => router.push("/admin/marketplace")}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
