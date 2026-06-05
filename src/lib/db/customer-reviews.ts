import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicDataClient } from "@/lib/supabase/public-data";

export type CustomerReview = {
  id: string;
  customerName: string;
  serviceType: string;
  rating: number;
  reviewText: string;
  avatarPath: string | null;
  sortOrder: number;
  isActive: boolean;
};

type Row = {
  id: string;
  customer_name: string;
  service_type: string;
  rating: number;
  review_text: string;
  avatar_path: string | null;
  sort_order: number;
  is_active: boolean;
};

function mapRow(row: Row): CustomerReview {
  return {
    id: row.id,
    customerName: row.customer_name,
    serviceType: row.service_type,
    rating: row.rating,
    reviewText: row.review_text,
    avatarPath: row.avatar_path,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export async function getPublicCustomerReviews(): Promise<CustomerReview[]> {
  const supabase = await getPublicDataClient();
  const { data, error } = await supabase
    .from("customer_reviews")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data as Row[]) ?? []).map(mapRow);
}

export async function getAdminCustomerReviews(): Promise<CustomerReview[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customer_reviews")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data as Row[]) ?? []).map(mapRow);
}

export async function getCustomerReviewById(
  id: string
): Promise<CustomerReview | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("customer_reviews")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as Row) : null;
}
