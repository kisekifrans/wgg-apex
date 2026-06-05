"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createPromoCode,
  deletePromoCode,
  setPromoCodeActive,
} from "@/actions/admin/promo/promo-codes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPriceFromCents } from "@/lib/services/format-price";
import type { PromoCode } from "@/types/promo";

const SERVICE_OPTIONS = [
  { value: "", label: "Any service" },
  { value: "predator-maintenance", label: "Predator Maintenance" },
  { value: "ranked-boosting", label: "Ranked Boosting" },
  { value: "self-play-boosting", label: "Duo Ranked Boost" },
  { value: "badge-boosting", label: "Badge Boosting" },
  { value: "apex-unban", label: "Apex Unban" },
  { value: "relinking", label: "Account Relinking" },
  { value: "kills-farming", label: "Kills Farming" },
];

type PromoCodesPanelProps = {
  promos: PromoCode[];
};

export function PromoCodesPanel({ promos }: PromoCodesPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-xl border border-white/5 bg-card/40 p-6">
      <h2 className="font-heading text-lg font-semibold">Promo codes</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Create discount codes for checkout. Featured codes appear on the homepage
        promo banner.
      </p>

      <form
        className="mt-6 grid gap-4 sm:grid-cols-2"
        action={async (fd) => {
          startTransition(async () => {
            const result = await createPromoCode(fd);
            if (!result.success) toast.error(result.error);
            else toast.success("Promo code created");
            router.refresh();
          });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            name="code"
            required
            placeholder="PREDATOR20"
            className="border-white/10 bg-background/50 uppercase"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountDollars">Discount (USD)</Label>
          <Input
            id="discountDollars"
            name="discountDollars"
            type="number"
            min="1"
            step="1"
            required
            placeholder="20"
            className="border-white/10 bg-background/50"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            placeholder="$20 off Predator Maintenance"
            className="border-white/10 bg-background/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceSlug">Applies to</Label>
          <select
            id="serviceSlug"
            name="serviceSlug"
            className="flex h-10 w-full rounded-md border border-white/10 bg-background/50 px-3 text-sm"
          >
            {SERVICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxRedemptions">Max uses (optional)</Label>
          <Input
            id="maxRedemptions"
            name="maxRedemptions"
            type="number"
            min="1"
            placeholder="Unlimited"
            className="border-white/10 bg-background/50"
          />
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="isFeatured" className="accent-primary" />
          Show on homepage promo banner
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Create promo code
          </Button>
        </div>
      </form>

      {promos.length > 0 ? (
        <div className="mt-8 space-y-3">
          {promos.map((promo) => (
            <div
              key={promo.id}
              className="flex flex-col gap-3 rounded-lg border border-white/10 bg-background/30 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-semibold">{promo.code}</span>
                  <Badge variant="outline">
                    −{formatPriceFromCents(promo.discountCents)}
                  </Badge>
                  {promo.isFeatured ? (
                    <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                      Featured
                    </Badge>
                  ) : null}
                  {!promo.isActive ? (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactive
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {promo.description ?? "No description"}
                  {promo.serviceSlug ? ` · ${promo.serviceSlug}` : " · All services"}
                  {" · "}
                  Used {promo.redemptionCount}
                  {promo.maxRedemptions != null
                    ? ` / ${promo.maxRedemptions}`
                    : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      const result = await setPromoCodeActive(
                        promo.id,
                        !promo.isActive
                      );
                      if (!result.success) toast.error(result.error);
                      else toast.success(promo.isActive ? "Deactivated" : "Activated");
                      router.refresh();
                    });
                  }}
                >
                  {promo.isActive ? "Deactivate" : "Activate"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm(`Delete promo code ${promo.code}?`)) return;
                    startTransition(async () => {
                      const result = await deletePromoCode(promo.id);
                      if (!result.success) toast.error(result.error);
                      else toast.success("Deleted");
                      router.refresh();
                    });
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
