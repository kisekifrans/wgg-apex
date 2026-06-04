import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicDataClient } from "@/lib/supabase/public-data";
import { computeFromPriceCents } from "@/lib/services/from-price";
import type {
  CatalogPricingItem,
  CatalogService,
  PricingEngine,
  PublicServicesCatalog,
  ServiceDisplayConfig,
} from "@/types/services";

type ServiceRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  pricing_engine: PricingEngine;
  icon: string;
  href: string;
  price_label: string | null;
  from_price_cents: number | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  display_config: ServiceDisplayConfig;
  created_at: string;
  updated_at: string;
};

type ItemRow = {
  id: string;
  service_id: string;
  name: string;
  subtitle: string | null;
  price_cents: number;
  currency: string;
  eta_label: string | null;
  difficulty: string | null;
  features: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

function mapItem(row: ItemRow): CatalogPricingItem {
  return {
    id: row.id,
    serviceId: row.service_id,
    name: row.name,
    subtitle: row.subtitle,
    priceCents: row.price_cents,
    currency: row.currency,
    etaLabel: row.eta_label,
    difficulty: row.difficulty,
    features: Array.isArray(row.features) ? row.features : [],
    isFeatured: row.is_featured,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

function mapService(row: ServiceRow, items: ItemRow[] = []): CatalogService {
  const pricingItems = items
    .filter((i) => i.service_id === row.id)
    .map(mapItem)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    pricingEngine: row.pricing_engine,
    icon: row.icon,
    href: row.href,
    priceLabel: row.price_label,
    fromPriceCents: row.from_price_cents,
    isActive: row.is_active,
    isFeatured: row.is_featured ?? false,
    sortOrder: row.sort_order,
    displayConfig: row.display_config ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    pricingItems,
  };
}

async function attachItems(
  services: ServiceRow[],
  activeOnly: boolean,
  supabase?: SupabaseClient
): Promise<CatalogService[]> {
  if (services.length === 0) return [];

  const client = supabase ?? (await getPublicDataClient());
  const ids = services.map((s) => s.id);

  let query = client
    .from("service_pricing_items")
    .select("*")
    .in("service_id", ids)
    .order("sort_order", { ascending: true });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data: items, error } = await query;
  if (error) throw new Error(error.message);

  return services.map((s) => mapService(s, (items as ItemRow[]) ?? []));
}

export async function getAdminServices(): Promise<CatalogService[]> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return attachItems((data as ServiceRow[]) ?? [], false);
}

export async function getServiceById(id: string): Promise<CatalogService | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const [service] = await attachItems([data as ServiceRow], false);
  return service ?? null;
}

export async function getServiceBySlug(
  slug: string,
  activeOnly = true
): Promise<CatalogService | null> {
  const client = await getPublicDataClient();

  let query = client.from("services").select("*").eq("slug", slug);

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const [service] = await attachItems(
    [data as ServiceRow],
    activeOnly,
    client
  );
  return service ?? null;
}

export async function recalculateServiceFromPrice(
  serviceId: string
): Promise<void> {
  const supabase = createAdminClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("pricing_engine")
    .eq("id", serviceId)
    .single();

  if (serviceError) throw new Error(serviceError.message);

  const { data: items, error: itemsError } = await supabase
    .from("service_pricing_items")
    .select("price_cents, is_active")
    .eq("service_id", serviceId)
    .eq("is_active", true);

  if (itemsError) throw new Error(itemsError.message);

  const fromPrice = computeFromPriceCents(
    (items ?? []).map((i) => ({
      priceCents: i.price_cents,
      isActive: i.is_active,
    })),
    service.pricing_engine
  );

  const { error: updateError } = await supabase
    .from("services")
    .update({ from_price_cents: fromPrice })
    .eq("id", serviceId);

  if (updateError) throw new Error(updateError.message);
}

export async function getPublicServicesCatalog(): Promise<PublicServicesCatalog> {
  const client = await getPublicDataClient();

  const { data: services, error } = await client
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (services as ServiceRow[]) ?? [];
  const ids = rows.map((s) => s.id);

  let items: ItemRow[] = [];
  if (ids.length > 0) {
    const { data: itemData, error: itemError } = await client
      .from("service_pricing_items")
      .select("*")
      .in("service_id", ids)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (itemError) throw new Error(itemError.message);
    items = (itemData as ItemRow[]) ?? [];
  }

  const catalog = rows.map((s) => mapService(s, items));
  const featuredService = catalog.find((s) => s.isFeatured) ?? null;
  const overview = catalog.filter((s) => !s.isFeatured);

  const bySlug = (slug: string) => catalog.find((s) => s.slug === slug) ?? null;

  return {
    featuredService,
    overview,
    rankedBoost: bySlug("ranked-boosting"),
    selfPlayBoost: bySlug("self-play-boosting"),
    predatorMaintenance: bySlug("predator-maintenance"),
    badgeBoosting: bySlug("badge-boosting"),
    unbanService: bySlug("apex-unban"),
  };
}
