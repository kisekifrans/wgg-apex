"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MARKETPLACE_PLATFORMS,
  MARKETPLACE_SORT_OPTIONS,
  PUBLIC_MARKETPLACE_STATUSES,
} from "@/types/marketplace";

export function MarketplaceToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "all";
  const platform = searchParams.get("platform") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";

  function apply(formData: FormData) {
    const qVal = String(formData.get("q") ?? "").trim();
    const statusVal = String(formData.get("status") ?? "all");
    const platformVal = String(formData.get("platform") ?? "all");
    const sortVal = String(formData.get("sort") ?? "newest");

    const next = new URLSearchParams();
    if (qVal) next.set("q", qVal);
    if (statusVal && statusVal !== "all") next.set("status", statusVal);
    if (platformVal && platformVal !== "all") next.set("platform", platformVal);
    if (sortVal && sortVal !== "newest") next.set("sort", sortVal);

    startTransition(() => {
      const query = next.toString();
      router.push(query ? `/marketplace?${query}` : "/marketplace");
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(new FormData(e.currentTarget));
      }}
      className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-4 sm:p-5"
    >
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <SlidersHorizontal className="size-4 text-primary" aria-hidden />
        Filter & sort listings
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-4">
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
              placeholder="Rank, title, tags…"
              className="border-white/10 bg-background/50 pl-9"
            />
          </div>
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="field-select"
          >
            {PUBLIC_MARKETPLACE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="platform">Platform</Label>
          <select
            id="platform"
            name="platform"
            defaultValue={platform}
            className="field-select"
          >
            <option value="all">All platforms</option>
            {MARKETPLACE_PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 lg:col-span-4">
          <Label htmlFor="sort">Sort</Label>
          <select id="sort" name="sort" defaultValue={sort} className="field-select">
            {MARKETPLACE_SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
        >
          {isPending ? "Applying…" : "Apply"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-white/10"
          disabled={isPending}
          onClick={() => router.push("/marketplace")}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
