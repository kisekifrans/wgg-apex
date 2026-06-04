"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import { generateListingNumber } from "@/lib/marketplace/listing-number";
import {
  MAX_LISTING_IMAGE_BYTES,
  MAX_LISTING_IMAGES,
} from "@/lib/marketplace/images";
import {
  buildListingImagePath,
  MARKETPLACE_BUCKET,
} from "@/lib/marketplace/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  dollarsToCents,
  marketplaceListingSchema,
  parseTags,
} from "@/lib/validations/marketplace";
import type { MarketplaceListingStatus } from "@/types/marketplace";

const REVALIDATE_PATHS = ["/", "/admin/marketplace", "/marketplace"];

function revalidateMarketplace() {
  REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createMarketplaceListing(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const admin = await requireAdmin();

  const parsed = marketplaceListingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    rankLabel: formData.get("rankLabel"),
    rpLabel: formData.get("rpLabel"),
    platform: formData.get("platform"),
    priceDollars: formData.get("priceDollars"),
    heirloomCount: formData.get("heirloomCount"),
    ballerCount: formData.get("ballerCount"),
    status: formData.get("status"),
    isFeatured: formData.get("isFeatured") === "on",
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const input = parsed.data;
  const supabase = createAdminClient();
  const listingNumber = await generateListingNumber();

  const { data: listing, error } = await supabase
    .from("marketplace_listings")
    .insert({
      listing_number: listingNumber,
      title: input.title,
      description: input.description ?? null,
      rank_label: input.rankLabel,
      rp_label: input.rpLabel ?? null,
      platform: input.platform,
      price_cents: dollarsToCents(input.priceDollars),
      heirloom_count: input.heirloomCount,
      baller_count: input.ballerCount,
      status: input.status,
      is_featured: input.isFeatured,
      tags: parseTags(input.tags),
      created_by: admin.id,
      published_at: input.status === "available" ? new Date().toISOString() : null,
      sold_at: input.status === "sold" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !listing) {
    return { success: false, error: error?.message ?? "Failed to create listing" };
  }

  const uploadResult = await uploadListingImages(
    listing.id,
    formData.getAll("images")
  );

  if (!uploadResult.success) {
    return uploadResult;
  }

  revalidateMarketplace();
  revalidatePath(`/marketplace/${listing.id}`);
  redirect(`/admin/marketplace/${listing.id}`);
}

export async function updateMarketplaceListing(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = marketplaceListingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    rankLabel: formData.get("rankLabel"),
    rpLabel: formData.get("rpLabel"),
    platform: formData.get("platform"),
    priceDollars: formData.get("priceDollars"),
    heirloomCount: formData.get("heirloomCount"),
    ballerCount: formData.get("ballerCount"),
    status: formData.get("status"),
    isFeatured: formData.get("isFeatured") === "on",
    tags: formData.get("tags"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("marketplace_listings")
    .update({
      title: input.title,
      description: input.description ?? null,
      rank_label: input.rankLabel,
      rp_label: input.rpLabel ?? null,
      platform: input.platform,
      price_cents: dollarsToCents(input.priceDollars),
      heirloom_count: input.heirloomCount,
      baller_count: input.ballerCount,
      status: input.status,
      is_featured: input.isFeatured,
      tags: parseTags(input.tags),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  const newImages = formData.getAll("images");
  if (newImages.length > 0) {
    const uploadResult = await uploadListingImages(id, newImages);
    if (!uploadResult.success) return uploadResult;
  }

  const removeIds = formData
    .getAll("removeImageIds")
    .map(String)
    .filter(Boolean);

  if (removeIds.length > 0) {
    const removeResult = await deleteListingImages(id, removeIds);
    if (!removeResult.success) return removeResult;
  }

  revalidateMarketplace();
  revalidatePath(`/marketplace/${id}`);
  return { success: true, data: undefined };
}

export async function deleteMarketplaceListing(
  id: string
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: images } = await supabase
    .from("marketplace_listing_images")
    .select("storage_path")
    .eq("listing_id", id);

  const { error } = await supabase
    .from("marketplace_listings")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  if (images?.length) {
    await supabase.storage
      .from(MARKETPLACE_BUCKET)
      .remove(images.map((i) => i.storage_path));
  }

  revalidateMarketplace();
  redirect("/admin/marketplace");
}

export async function updateListingStatus(
  id: string,
  status: MarketplaceListingStatus
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("marketplace_listings")
    .update({ status })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateMarketplace();
  return { success: true, data: undefined };
}

async function uploadListingImages(
  listingId: string,
  files: FormDataEntryValue[]
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const validFiles = files.filter((f): f is File => f instanceof File && f.size > 0);

  if (validFiles.length === 0) {
    return { success: true, data: undefined };
  }

  const { count } = await supabase
    .from("marketplace_listing_images")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  const existingCount = count ?? 0;

  if (existingCount + validFiles.length > MAX_LISTING_IMAGES) {
    return {
      success: false,
      error: `Maximum ${MAX_LISTING_IMAGES} images per listing (${existingCount} already uploaded).`,
    };
  }

  let sortOrder = existingCount;

  for (const file of validFiles) {
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Only image files are allowed" };
    }
    if (file.size > MAX_LISTING_IMAGE_BYTES) {
      return { success: false, error: "Images must be under 5MB" };
    }

    const storagePath = buildListingImagePath(listingId, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(MARKETPLACE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { error: dbError } = await supabase
      .from("marketplace_listing_images")
      .insert({
        listing_id: listingId,
        storage_path: storagePath,
        sort_order: sortOrder++,
        alt_text: file.name,
      });

    if (dbError) {
      await supabase.storage.from(MARKETPLACE_BUCKET).remove([storagePath]);
      return { success: false, error: dbError.message };
    }
  }

  return { success: true, data: undefined };
}

async function deleteListingImages(
  listingId: string,
  imageIds: string[]
): Promise<ActionResult> {
  const supabase = createAdminClient();

  const { data: images, error: fetchError } = await supabase
    .from("marketplace_listing_images")
    .select("id, storage_path")
    .eq("listing_id", listingId)
    .in("id", imageIds);

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!images?.length) {
    return { success: true, data: undefined };
  }

  const { error } = await supabase
    .from("marketplace_listing_images")
    .delete()
    .in("id", imageIds);

  if (error) {
    return { success: false, error: error.message };
  }

  await supabase.storage
    .from(MARKETPLACE_BUCKET)
    .remove(images.map((i) => i.storage_path));

  return { success: true, data: undefined };
}
