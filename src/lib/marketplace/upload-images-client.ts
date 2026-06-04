import { createClient } from "@/lib/supabase/client";
import {
  MAX_LISTING_IMAGE_BYTES,
  MAX_LISTING_IMAGES,
} from "@/lib/marketplace/images";
import {
  buildListingImagePath,
  MARKETPLACE_BUCKET,
} from "@/lib/marketplace/images";

export type ClientImageUploadResult =
  | { success: true; uploaded: number }
  | { success: false; error: string };

/**
 * Upload listing images from the browser → Supabase Storage.
 * Avoids Next.js Server Action body limits (default 1MB) that break multi-image saves.
 */
export async function uploadListingImagesFromClient(
  listingId: string,
  files: File[],
  existingCount: number
): Promise<ClientImageUploadResult> {
  if (files.length === 0) {
    return { success: true, uploaded: 0 };
  }

  if (existingCount + files.length > MAX_LISTING_IMAGES) {
    return {
      success: false,
      error: `Maximum ${MAX_LISTING_IMAGES} images per listing (${existingCount} already on this listing).`,
    };
  }

  const supabase = createClient();
  let sortOrder = existingCount;
  let uploaded = 0;

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Only image files are allowed." };
    }
    if (file.size > MAX_LISTING_IMAGE_BYTES) {
      return {
        success: false,
        error: `${file.name} must be under 5MB.`,
      };
    }

    const storagePath = buildListingImagePath(listingId, file.name);

    const { error: uploadError } = await supabase.storage
      .from(MARKETPLACE_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message || `Failed to upload ${file.name}`,
      };
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
      return {
        success: false,
        error: dbError.message || `Failed to save ${file.name} to listing`,
      };
    }

    uploaded += 1;
  }

  return { success: true, uploaded };
}
