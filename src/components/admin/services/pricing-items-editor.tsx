"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  createPricingItem,
  deletePricingItem,
  reorderPricingItems,
  updatePricingItem,
} from "@/actions/admin/services/catalog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DIFFICULTY_OPTIONS } from "@/config/services";
import { formatOrderAmount } from "@/lib/orders/format";
import { centsToDisplayDollars } from "@/lib/marketplace/format";
import { cn } from "@/lib/utils";
import type { CatalogPricingItem, CatalogService } from "@/types/services";

export function PricingItemsEditor({ service }: { service: CatalogService }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const items = service.pricingItems;
  const showSubtitle = ["tier_table", "subscription_plans"].includes(
    service.pricingEngine
  );
  const showEta = service.pricingEngine === "tier_table";
  const showDifficulty = service.pricingEngine === "catalog_items";
  const showFeatures = service.pricingEngine === "subscription_plans";
  const showFeatured = service.pricingEngine === "subscription_plans";

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;

    const ordered = [...items];
    const [removed] = ordered.splice(index, 1);
    ordered.splice(target, 0, removed);

    startTransition(async () => {
      const result = await reorderPricingItems(
        service.id,
        ordered.map((i) => i.id)
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  }

  async function handleItemSubmit(
    e: React.FormEvent<HTMLFormElement>,
    item?: CatalogPricingItem
  ) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = item
        ? await updatePricingItem(item.id, service.id, formData)
        : await createPricingItem(service.id, formData);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(item ? "Price updated" : "Pricing row added");
      setAdding(false);
      setEditingId(null);
      router.refresh();
    });
  }

  function handleDelete(item: CatalogPricingItem) {
    if (!confirm(`Delete "${item.name}"?`)) return;

    startTransition(async () => {
      const result = await deletePricingItem(item.id, service.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Pricing row removed");
      router.refresh();
    });
  }

  if (service.pricingEngine === "marketplace") {
    return (
      <div className="rounded-xl border border-white/5 bg-card/40 p-6 text-sm text-muted-foreground">
        Marketplace pricing is managed per listing in{" "}
        <a href="/admin/marketplace" className="text-primary hover:underline">
          Account Marketplace
        </a>
        .
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">Pricing</h2>
          <p className="text-sm text-muted-foreground">
            Changes publish to the homepage immediately after save.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-white/10"
          disabled={adding || pending}
          onClick={() => {
            setAdding(true);
            setEditingId(null);
          }}
        >
          <Plus className="size-4" data-icon="inline-start" />
          Add row
        </Button>
      </div>

      <ul className={cn("space-y-3", pending && "opacity-60")}>
        {items.map((item, index) => (
          <li key={item.id}>
            {editingId === item.id ? (
              <PricingItemForm
                item={item}
                showSubtitle={showSubtitle}
                showEta={showEta}
                showDifficulty={showDifficulty}
                showFeatures={showFeatures}
                showFeatured={showFeatured}
                onCancel={() => setEditingId(null)}
                onSubmit={(e) => handleItemSubmit(e, item)}
                pending={pending}
              />
            ) : (
              <div
                className={cn(
                  "flex flex-col gap-3 rounded-xl border border-white/5 bg-card/40 p-4 sm:flex-row sm:items-center",
                  !item.isActive && "opacity-50"
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.name}</p>
                  {item.subtitle && (
                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                  )}
                  <p className="mt-1 font-mono text-sm font-semibold text-primary">
                    {formatOrderAmount(item.priceCents)}
                    {item.etaLabel && (
                      <span className="ml-2 font-sans font-normal text-muted-foreground">
                        · {item.etaLabel}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0 || pending}
                    onClick={() => moveItem(index, -1)}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === items.length - 1 || pending}
                    onClick={() => moveItem(index, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/10"
                    onClick={() => {
                      setEditingId(item.id);
                      setAdding(false);
                    }}
                  >
                    Edit price
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {adding && (
        <PricingItemForm
          showSubtitle={showSubtitle}
          showEta={showEta}
          showDifficulty={showDifficulty}
          showFeatures={showFeatures}
          showFeatured={showFeatured}
          onCancel={() => setAdding(false)}
          onSubmit={(e) => handleItemSubmit(e)}
          pending={pending}
        />
      )}
    </section>
  );
}

function PricingItemForm({
  item,
  showSubtitle,
  showEta,
  showDifficulty,
  showFeatures,
  showFeatured,
  onCancel,
  onSubmit,
  pending,
}: {
  item?: CatalogPricingItem;
  showSubtitle: boolean;
  showEta: boolean;
  showDifficulty: boolean;
  showFeatures: boolean;
  showFeatured: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  pending: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-primary/20 bg-card/50 p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`name-${item?.id ?? "new"}`}>Name</Label>
          <Input
            id={`name-${item?.id ?? "new"}`}
            name="name"
            required
            defaultValue={item?.name ?? ""}
            className="border-white/10 bg-background/50"
          />
        </div>

        {showSubtitle && (
          <div className="space-y-2">
            <Label htmlFor={`subtitle-${item?.id ?? "new"}`}>Subtitle</Label>
            <Input
              id={`subtitle-${item?.id ?? "new"}`}
              name="subtitle"
              placeholder="IV → I or per week"
              defaultValue={item?.subtitle ?? ""}
              className="border-white/10 bg-background/50"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={`price-${item?.id ?? "new"}`}>Price (USD)</Label>
          <Input
            id={`price-${item?.id ?? "new"}`}
            name="priceDollars"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={
              item ? centsToDisplayDollars(item.priceCents) : ""
            }
            className="border-white/10 bg-background/50"
          />
        </div>

        {showEta && (
          <div className="space-y-2">
            <Label htmlFor={`eta-${item?.id ?? "new"}`}>ETA</Label>
            <Input
              id={`eta-${item?.id ?? "new"}`}
              name="etaLabel"
              defaultValue={item?.etaLabel ?? ""}
              className="border-white/10 bg-background/50"
            />
          </div>
        )}

        {showDifficulty && (
          <div className="space-y-2">
            <Label htmlFor={`diff-${item?.id ?? "new"}`}>Difficulty</Label>
            <select
              id={`diff-${item?.id ?? "new"}`}
              name="difficulty"
              defaultValue={item?.difficulty ?? "Standard"}
              className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {showFeatures && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor={`features-${item?.id ?? "new"}`}>
              Plan features (one per line)
            </Label>
            <Textarea
              id={`features-${item?.id ?? "new"}`}
              name="features"
              rows={4}
              defaultValue={item?.features.join("\n") ?? ""}
              className="border-white/10 bg-background/50"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          {showFeatured && (
            <div className="flex items-center gap-2">
              <Checkbox
                id={`featured-${item?.id ?? "new"}`}
                name="isFeatured"
                defaultChecked={item?.isFeatured ?? false}
              />
              <Label htmlFor={`featured-${item?.id ?? "new"}`} className="font-normal">
                Featured plan
              </Label>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Checkbox
              id={`active-${item?.id ?? "new"}`}
              name="isActive"
              defaultChecked={item?.isActive ?? true}
            />
            <Label htmlFor={`active-${item?.id ?? "new"}`} className="font-normal">
              Active
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          disabled={pending}
          className="bg-primary text-primary-foreground"
        >
          {pending && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
