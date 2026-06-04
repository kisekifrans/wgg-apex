"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  createMarketplaceListing,
  deleteMarketplaceListing,
  updateMarketplaceListing,
} from "@/actions/admin/marketplace/listings";
import { ListingCardImage } from "@/components/admin/marketplace/listing-card-image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { centsToDisplayDollars } from "@/lib/marketplace/format";
import type { MarketplaceListing } from "@/types/marketplace";
import {
  MARKETPLACE_PLATFORMS,
  MARKETPLACE_STATUSES,
} from "@/types/marketplace";

type ListingFormProps = {
  mode: "create" | "edit";
  listing?: MarketplaceListing;
};

export function ListingForm({ mode, listing }: ListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);
  const [previewFiles, setPreviewFiles] = useState<
    { id: string; url: string }[]
  >([]);

  const existingImages =
    listing?.images.filter((img) => !removeImageIds.includes(img.id)) ?? [];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newPreviews = files.map((file) => ({
      id: `${file.name}-${file.size}`,
      url: URL.createObjectURL(file),
    }));
    setPreviewFiles((prev) => [...prev, ...newPreviews]);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    removeImageIds.forEach((id) => formData.append("removeImageIds", id));

    const result =
      mode === "create"
        ? await createMarketplaceListing(formData)
        : await updateMarketplaceListing(listing!.id, formData);

    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    if (mode === "edit") {
      toast.success("Listing updated");
      router.refresh();
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!listing) return;
    if (!confirm("Delete this listing permanently?")) return;

    setLoading(true);
    const result = await deleteMarketplaceListing(listing.id);
    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
          <h2 className="font-heading text-lg font-semibold">Details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={listing?.title}
                placeholder="Master · 2 Heirlooms"
                className="border-white/10 bg-background/50"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={5}
                defaultValue={listing?.description ?? ""}
                placeholder="Account highlights, legends, badges, transfer notes…"
                className="border-white/10 bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rankLabel">Rank</Label>
              <Input
                id="rankLabel"
                name="rankLabel"
                required
                defaultValue={listing?.rankLabel}
                placeholder="Diamond IV"
                className="border-white/10 bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rpLabel">RP (optional)</Label>
              <Input
                id="rpLabel"
                name="rpLabel"
                defaultValue={listing?.rpLabel ?? ""}
                placeholder="12,500 RP"
                className="border-white/10 bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                name="platform"
                required
                defaultValue={listing?.platform ?? "pc"}
                className="flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
              >
                {MARKETPLACE_PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heirloomCount">Heirloom count</Label>
              <Input
                id="heirloomCount"
                name="heirloomCount"
                type="number"
                min={0}
                max={99}
                required
                defaultValue={listing?.heirloomCount ?? 0}
                className="border-white/10 bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceDollars">Price (USD)</Label>
              <Input
                id="priceDollars"
                name="priceDollars"
                type="number"
                min={0.01}
                step={0.01}
                required
                defaultValue={
                  listing ? centsToDisplayDollars(listing.priceCents) : ""
                }
                placeholder="420.00"
                className="border-white/10 bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                required
                defaultValue={listing?.status ?? "draft"}
                className="flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
              >
                {MARKETPLACE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                name="tags"
                defaultValue={listing?.tags.join(", ") ?? ""}
                placeholder="Heirloom, Clean history"
                className="border-white/10 bg-background/50"
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <Checkbox
                id="isFeatured"
                name="isFeatured"
                defaultChecked={listing?.isFeatured}
              />
              <Label htmlFor="isFeatured" className="font-normal">
                Feature on homepage
              </Label>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
          <h2 className="font-heading text-lg font-semibold">Images</h2>
          <p className="text-sm text-muted-foreground">
            Upload JPEG, PNG, or WebP up to 5MB each. First image is the cover.
          </p>

          <Input
            type="file"
            name="images"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileChange}
            className="border-white/10 bg-background/50"
          />

          {(existingImages.length > 0 || previewFiles.length > 0) && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {existingImages.map((image) => (
                <div key={image.id} className="group relative aspect-video">
                  <Image
                    src={image.publicUrl}
                    alt={image.altText ?? ""}
                    fill
                    className="rounded-lg object-cover"
                    sizes="160px"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setRemoveImageIds((ids) => [...ids, image.id])
                    }
                    className="absolute right-1 top-1 rounded-md bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
              {previewFiles.map((preview) => (
                <div key={preview.id} className="relative aspect-video">
                  <Image
                    src={preview.url}
                    alt=""
                    fill
                    className="rounded-lg object-cover"
                    sizes="160px"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    New
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                Saving…
              </>
            ) : mode === "create" ? (
              "Create listing"
            ) : (
              "Save changes"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/10"
            render={<Link href="/admin/marketplace" />}
          >
            Cancel
          </Button>
          {mode === "edit" && (
            <Button
              type="button"
              variant="destructive"
              disabled={loading}
              onClick={handleDelete}
              className="ml-auto"
            >
              <Trash2 className="size-4" data-icon="inline-start" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="space-y-3 rounded-xl border border-white/5 bg-card/40 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Preview
          </p>
          {listing ? (
            <ListingCardImage listing={listing} />
          ) : (
            <div className="aspect-[16/10] rounded-lg bg-white/5" />
          )}
          <p className="text-sm text-muted-foreground">
            Sold listings remain visible with a sold overlay on the storefront.
          </p>
        </div>
      </aside>
    </form>
  );
}
