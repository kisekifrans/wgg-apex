import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORD-${year}-`;

  const supabase = createAdminClient();

  const { count, error } = await supabase
    .from("service_orders")
    .select("id", { count: "exact", head: true })
    .like("order_number", `${prefix}%`);

  if (error) {
    throw new Error(error.message);
  }

  const next = (count ?? 0) + 1;
  return `${prefix}${String(next).padStart(5, "0")}`;
}
