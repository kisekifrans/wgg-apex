"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createService,
  deleteService,
  updateService,
} from "@/actions/admin/services/catalog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PRICING_ENGINE_LABELS } from "@/config/services";
import { SERVICE_ICON_OPTIONS } from "@/lib/services/icons";
import { PRICING_ENGINES, type CatalogService } from "@/types/services";

type ServiceFormProps = {
  mode: "create" | "edit";
  service?: CatalogService;
};

export function ServiceForm({ mode, service }: ServiceFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const featuresText =
    service?.displayConfig?.features?.join("\n") ?? "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result =
      mode === "create"
        ? await createService(formData)
        : await updateService(service!.id, formData);

    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    if (mode === "edit") {
      toast.success("Service updated");
      router.refresh();
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!service) return;
    if (!confirm("Delete this service and all pricing rows?")) return;
    setLoading(true);
    const result = await deleteService(service.id);
    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
        <h2 className="font-heading text-lg font-semibold">Service details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={service?.name ?? ""}
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              required
              placeholder="ranked-boosting"
              defaultValue={service?.slug ?? ""}
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricingEngine">Pricing model</Label>
            <select
              id="pricingEngine"
              name="pricingEngine"
              required
              defaultValue={service?.pricingEngine ?? "tier_table"}
              disabled={mode === "edit"}
              className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
            >
              {PRICING_ENGINES.map((e) => (
                <option key={e} value={e}>
                  {PRICING_ENGINE_LABELS[e]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="icon">Icon</Label>
            <select
              id="icon"
              name="icon"
              defaultValue={service?.icon ?? "trophy"}
              className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
            >
              {SERVICE_ICON_OPTIONS.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="href">Link / anchor</Label>
            <Input
              id="href"
              name="href"
              required
              defaultValue={service?.href ?? "#"}
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="priceLabel">Price label (optional)</Label>
            <Input
              id="priceLabel"
              name="priceLabel"
              placeholder="/ week or Listings vary"
              defaultValue={service?.priceLabel ?? ""}
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="shortDescription">Short description</Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={service?.shortDescription ?? ""}
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={service?.description ?? ""}
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="features">Feature bullets (one per line, unban etc.)</Label>
            <Textarea
              id="features"
              name="features"
              rows={4}
              defaultValue={featuresText}
              className="border-white/10 bg-background/50"
            />
          </div>

          <div className="flex items-center gap-2 sm:col-span-2">
            <Checkbox
              id="isActive"
              name="isActive"
              defaultChecked={service?.isActive ?? true}
            />
            <Label htmlFor="isActive" className="font-normal">
              Visible on marketing site
            </Label>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
        >
          {loading && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
          {mode === "create" ? "Create service" : "Save service"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-white/10"
          render={<Link href="/admin/services" />}
        >
          Cancel
        </Button>
        {mode === "edit" && (
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={handleDelete}
          >
            <Trash2 className="size-4" data-icon="inline-start" />
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}
