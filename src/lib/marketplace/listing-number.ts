import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function generateListingNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ACC-${year}-`;

  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("marketplace_listings")
    .select("id", { count: "exact", head: true })
    .like("listing_number", `${prefix}%`);

  if (error) {
    throw new Error(error.message);
  }

  const next = (count ?? 0) + 1;
  return `${prefix}${String(next).padStart(5, "0")}`;
}
