"use server";

import { listCustomerOrders } from "@/lib/db/public-orders";
import { getSessionUser } from "@/lib/auth/session";
import type { PublicOrderSnapshot } from "@/types/public-order";

export type CustomerOrdersResult =
  | { success: true; orders: PublicOrderSnapshot[] }
  | { success: false; error: string };

export async function getCustomerOrdersAction(): Promise<CustomerOrdersResult> {
  const session = await getSessionUser();

  if (!session?.email) {
    return { success: false, error: "Not signed in" };
  }

  const orders = await listCustomerOrders(session.email);
  return { success: true, orders };
}
