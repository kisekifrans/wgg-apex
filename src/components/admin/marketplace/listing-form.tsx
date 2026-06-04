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
import {
  LISTING_IMAGE_ACCEPT,
  MAX_LISTING_IMAGE_BYTES,
  MAX_LISTING_IMAGES,
} from "@/lib/marketplace/images";
import { DiscordPublishPanel } from "@/components/admin/discord/discord-publish-panel";
import type { DiscordPublishLog } from "@/lib/db/discord-publish-logs";
import type { MarketplaceListing } from "@/types/marketplace";
import {
  MARKETPLACE_PLATFORMS,
  MARKETPLACE_STATUSES,
} from "@/types/marketplace";

type ListingFormProps = {
  mode: "create" | "edit";
  listing?: MarketplaceListing;
  siteUrl?: string;
  discordWebhookConfigured?: boolean;
  discordLatestLog?: DiscordPublishLog | null;
};

export function ListingForm({
  mode,
  listing,
  siteUrl = "https://wggapex.com",
  discordWebhookConfigured = false,
  discordLatestLog = null,
}: ListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const existingImages =
    listing?.images.filter((img) => !removeImageIds.includes(img.id)) ?? [];

  const totalImageCount = existingImages.length + pendingFiles.length;
  const slotsRemaining = MAX_LISTING_IMAGES - totalImageCount;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";

    if (picked.length === 0) return;

    if (picked.length > slotsRemaining) {
      toast.error(
        `You can add ${slotsRemaining} more image${slotsRemaining === 1 ? "" : "s"} (max ${MAX_LISTING_IMAGES} total).`
      );
      return;
    }

    for (const file of picked) {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed.");
        return;
      }
      if (file.size > MAX_LISTING_IMAGE_BYTES) {
        toast.error(`${file.name} must be under 5MB.`);
        return;
      }
    }

    setPendingFiles((prev) => [...prev, ...picked]);
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.delete("images");
    pendingFiles.forEach((file) => formData.append("images", file));
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
            Select multiple files at once (up to {MAX_LISTING_IMAGES} per listing,
            5MB each). First image is the cover.{" "}
            {slotsRemaining > 0 ? (
              <span className="text-foreground/80">
                {slotsRemaining} slot{slotsRemaining === 1 ? "" : "s"} remaining.
              </span>
            ) : (
              <span className="text-primary">Maximum reached.</span>
            )}
          </p>

          <Input
            type="file"
            name="images"
            accept={LISTING_IMAGE_ACCEPT}
            multiple
            disabled={slotsRemaining === 0}
            onChange={handleFileChange}
            className="border-white/10 bg-background/50"
          />

          {(existingImages.length > 0 || pendingFiles.length > 0) && (
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
              {pendingFiles.map((file, index) => (
                <PendingImagePreview
                  key={`${file.name}-${file.size}-${index}`}
                  file={file}
                  onRemove={() => removePendingFile(index)}
                />
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

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        {mode === "edit" && listing && (
          <DiscordPublishPanel
            listing={listing}
            siteUrl={siteUrl}
            webhookConfigured={discordWebhookConfigured}
            latestLog={discordLatestLog}
          />
        )}

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

function PendingImagePreview({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  const [url] = useState(() => URL.createObjectURL(file));

  return (
    <div className="group relative aspect-video">
      <Image
        src={url}
        alt=""
        fill
        className="rounded-lg object-cover"
        sizes="160px"
      />
      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
        New
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-md bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Remove new image"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
