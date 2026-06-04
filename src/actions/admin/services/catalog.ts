"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/guards";
import {
  getServiceById,
  recalculateServiceFromPrice,
} from "@/lib/db/services-catalog";
import { dollarsToCents } from "@/lib/validations/marketplace";
import {
  parseFeatures,
  pricingItemSchema,
  serviceSchema,
} from "@/lib/validations/services";
import { createAdminClient } from "@/lib/supabase/admin";

const REVALIDATE_PATHS = ["/", "/admin/services"];

function revalidateCatalog() {
  REVALIDATE_PATHS.forEach((path) => revalidatePath(path));
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function emptyToNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function createService(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    pricingEngine: formData.get("pricingEngine"),
    icon: formData.get("icon"),
    href: formData.get("href"),
    priceLabel: formData.get("priceLabel"),
    isActive: formData.get("isActive") === "on",
    features: formData.get("features"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  const { count } = await supabase
    .from("services")
    .select("id", { count: "exact", head: true });

  const { data: service, error } = await supabase
    .from("services")
    .insert({
      slug: input.slug,
      name: input.name,
      short_description: emptyToNull(input.shortDescription ?? undefined),
      description: emptyToNull(input.description ?? undefined),
      pricing_engine: input.pricingEngine,
      icon: input.icon,
      href: input.href,
      price_label: emptyToNull(input.priceLabel ?? undefined),
      is_active: input.isActive,
      sort_order: count ?? 0,
      display_config: {
        features: parseFeatures(input.features),
      },
      from_price_cents:
        input.pricingEngine === "marketplace" ? null : 0,
    })
    .select("id")
    .single();

  if (error || !service) {
    return { success: false, error: error?.message ?? "Failed to create service" };
  }

  revalidateCatalog();
  redirect(`/admin/services/${service.id}`);
}

export async function updateService(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    pricingEngine: formData.get("pricingEngine"),
    icon: formData.get("icon"),
    href: formData.get("href"),
    priceLabel: formData.get("priceLabel"),
    isActive: formData.get("isActive") === "on",
    features: formData.get("features"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  const existing = await getServiceById(id);
  const displayConfig = {
    ...(existing?.displayConfig ?? {}),
    features: parseFeatures(input.features),
  };

  const { error } = await supabase
    .from("services")
    .update({
      name: input.name,
      slug: input.slug,
      short_description: emptyToNull(input.shortDescription ?? undefined),
      description: emptyToNull(input.description ?? undefined),
      pricing_engine: input.pricingEngine,
      icon: input.icon,
      href: input.href,
      price_label: emptyToNull(input.priceLabel ?? undefined),
      is_active: input.isActive,
      display_config: displayConfig,
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  await recalculateServiceFromPrice(id);
  revalidateCatalog();
  revalidatePath(`/admin/services/${id}`);
  return { success: true, data: undefined };
}

export async function toggleServiceVisibility(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("services")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateCatalog();
  return { success: true, data: undefined };
}

export async function reorderServices(
  orderedIds: string[]
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();

  const updates = orderedIds.map((id, index) =>
    supabase.from("services").update({ sort_order: index }).eq("id", id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);

  if (failed?.error) {
    return { success: false, error: failed.error.message };
  }

  revalidateCatalog();
  return { success: true, data: undefined };
}

export async function deleteService(id: string): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase.from("services").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateCatalog();
  redirect("/admin/services");
}

export async function createPricingItem(
  serviceId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = pricingItemSchema.safeParse({
    name: formData.get("name"),
    subtitle: formData.get("subtitle"),
    priceDollars: formData.get("priceDollars"),
    etaLabel: formData.get("etaLabel"),
    difficulty: formData.get("difficulty"),
    features: formData.get("features"),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const input = parsed.data;
  const supabase = createAdminClient();

  const { count } = await supabase
    .from("service_pricing_items")
    .select("id", { count: "exact", head: true })
    .eq("service_id", serviceId);

  const { error } = await supabase.from("service_pricing_items").insert({
    service_id: serviceId,
    name: input.name,
    subtitle: emptyToNull(input.subtitle ?? undefined),
    price_cents: dollarsToCents(input.priceDollars),
    eta_label: emptyToNull(input.etaLabel ?? undefined),
    difficulty: emptyToNull(input.difficulty ?? undefined),
    features: parseFeatures(input.features),
    is_featured: input.isFeatured,
    is_active: input.isActive,
    sort_order: count ?? 0,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  await recalculateServiceFromPrice(serviceId);
  revalidateCatalog();
  revalidatePath(`/admin/services/${serviceId}`);
  return { success: true, data: undefined };
}

export async function updatePricingItem(
  itemId: string,
  serviceId: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = pricingItemSchema.safeParse({
    name: formData.get("name"),
    subtitle: formData.get("subtitle"),
    priceDollars: formData.get("priceDollars"),
    etaLabel: formData.get("etaLabel"),
    difficulty: formData.get("difficulty"),
    features: formData.get("features"),
    isFeatured: formData.get("isFeatured") === "on",
    isActive: formData.get("isActive") === "on",
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
    .from("service_pricing_items")
    .update({
      name: input.name,
      subtitle: emptyToNull(input.subtitle ?? undefined),
      price_cents: dollarsToCents(input.priceDollars),
      eta_label: emptyToNull(input.etaLabel ?? undefined),
      difficulty: emptyToNull(input.difficulty ?? undefined),
      features: parseFeatures(input.features),
      is_featured: input.isFeatured,
      is_active: input.isActive,
    })
    .eq("id", itemId);

  if (error) {
    return { success: false, error: error.message };
  }

  await recalculateServiceFromPrice(serviceId);
  revalidateCatalog();
  revalidatePath(`/admin/services/${serviceId}`);
  return { success: true, data: undefined };
}

export async function deletePricingItem(
  itemId: string,
  serviceId: string
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("service_pricing_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return { success: false, error: error.message };
  }

  await recalculateServiceFromPrice(serviceId);
  revalidateCatalog();
  revalidatePath(`/admin/services/${serviceId}`);
  return { success: true, data: undefined };
}

export async function reorderPricingItems(
  serviceId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = createAdminClient();

  const updates = orderedIds.map((id, index) =>
    supabase
      .from("service_pricing_items")
      .update({ sort_order: index })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);

  if (failed?.error) {
    return { success: false, error: failed.error.message };
  }

  revalidateCatalog();
  revalidatePath(`/admin/services/${serviceId}`);
  return { success: true, data: undefined };
}
