"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createServiceOrder,
  deleteServiceOrder,
  updateServiceOrder,
} from "@/actions/admin/orders/orders";
import { OrderPaymentStatusBadge } from "@/components/admin/orders/order-payment-status-badge";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BADGE_OPTIONS,
  ORDER_RANK_OPTIONS,
  ORDER_TYPE_FIELDS,
  ORDER_TYPE_LABELS,
  ORDER_PAYMENT_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  PREDATOR_PLAN_OPTIONS,
} from "@/config/orders";
import { formatOrderAmount } from "@/lib/orders/format";
import { centsToDisplayDollars } from "@/lib/marketplace/format";
import type { ServiceOrder } from "@/types/orders";
import {
  SERVICE_ORDER_PAYMENT_STATUSES,
  SERVICE_ORDER_STATUSES,
  SERVICE_ORDER_TYPES,
  type ServiceOrderType,
} from "@/types/orders";

type OrderFormProps = {
  mode: "create" | "edit";
  order?: ServiceOrder;
};

export function OrderForm({ mode, order }: OrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState<ServiceOrderType>(
    order?.orderType ?? "ranked_boost"
  );

  const fields = useMemo(() => ORDER_TYPE_FIELDS[orderType], [orderType]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result =
      mode === "create"
        ? await createServiceOrder(formData)
        : await updateServiceOrder(order!.id, formData);

    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    if (mode === "edit") {
      toast.success("Order updated");
      router.refresh();
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!order) return;
    if (!confirm("Delete this order permanently?")) return;

    setLoading(true);
    const result = await deleteServiceOrder(order.id);
    if (!result.success) {
      toast.error(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
          <h2 className="font-heading text-lg font-semibold">Order type</h2>

          <div className="space-y-2">
            <Label htmlFor="orderType">Service</Label>
            <select
              id="orderType"
              name="orderType"
              required
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as ServiceOrderType)}
              className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
              disabled={mode === "edit"}
            >
              {SERVICE_ORDER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ORDER_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            {mode === "edit" && (
              <p className="text-xs text-muted-foreground">
                Order type cannot be changed after creation.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
          <h2 className="font-heading text-lg font-semibold">Customer</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customerDiscord">Discord *</Label>
              <Input
                id="customerDiscord"
                name="customerDiscord"
                required
                placeholder="username or username#0000"
                defaultValue={order?.customerDiscord ?? ""}
                className="border-white/10 bg-background/50"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customerEmail">Email (optional)</Label>
              <Input
                id="customerEmail"
                name="customerEmail"
                type="email"
                placeholder="customer@email.com"
                defaultValue={order?.customerEmail ?? ""}
                className="border-white/10 bg-background/50"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
          <h2 className="font-heading text-lg font-semibold">Service details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {fields.showCurrentRank && (
              <div className="space-y-2">
                <Label htmlFor="currentRank">{fields.currentRankLabel}</Label>
                <select
                  id="currentRank"
                  name="currentRank"
                  defaultValue={order?.currentRank ?? ""}
                  required={fields.requireCurrentRank}
                  className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
                >
                  <option value="">Select rank…</option>
                  {ORDER_RANK_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {fields.showTargetRank && (
              <div className="space-y-2">
                <Label htmlFor="targetRank">{fields.targetRankLabel}</Label>
                <select
                  id="targetRank"
                  name="targetRank"
                  defaultValue={order?.targetRank ?? ""}
                  required={fields.requireTargetRank}
                  className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
                >
                  <option value="">Select rank…</option>
                  {ORDER_RANK_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {fields.showServiceDetail && (
              <div
                className={
                  fields.showCurrentRank && !fields.showTargetRank
                    ? "space-y-2 sm:col-span-2"
                    : "space-y-2 sm:col-span-2"
                }
              >
                <Label htmlFor="serviceDetail">{fields.serviceDetailLabel}</Label>
                {orderType === "badge_boost" ? (
                  <select
                    id="serviceDetail"
                    name="serviceDetail"
                    defaultValue={order?.serviceDetail ?? ""}
                    required={fields.requireServiceDetail}
                    className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
                  >
                    <option value="">Select badge…</option>
                    {BADGE_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                ) : orderType === "predator_maintenance" ? (
                  <select
                    id="serviceDetail"
                    name="serviceDetail"
                    defaultValue={order?.serviceDetail ?? ""}
                    required={fields.requireServiceDetail}
                    className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
                  >
                    <option value="">Select plan…</option>
                    {PREDATOR_PLAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="serviceDetail"
                    name="serviceDetail"
                    defaultValue={order?.serviceDetail ?? ""}
                    className="border-white/10 bg-background/50"
                  />
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amountDollars">Quoted amount (USD)</Label>
              <Input
                id="amountDollars"
                name="amountDollars"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                defaultValue={
                  order?.amountCents != null
                    ? centsToDisplayDollars(order.amountCents)
                    : ""
                }
                className="border-white/10 bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={5}
              placeholder="Platform, duo preference, deadlines, operator handoff…"
              defaultValue={order?.notes ?? ""}
              className="border-white/10 bg-background/50"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-white/5 bg-card/40 p-6">
          <h2 className="font-heading text-lg font-semibold">Status</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Order status</Label>
              <select
                id="status"
                name="status"
                required
                defaultValue={order?.status ?? "pending"}
                className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
              >
                {SERVICE_ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Payment status</Label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                required
                defaultValue={order?.paymentStatus ?? "pending"}
                className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm"
              >
                {SERVICE_ORDER_PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_PAYMENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        {order && (
          <div className="space-y-3 rounded-xl border border-white/5 bg-card/40 p-4">
            <p className="font-mono text-xs text-muted-foreground">
              {order.orderNumber}
            </p>
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge status={order.status} />
              <OrderPaymentStatusBadge status={order.paymentStatus} />
            </div>
            <p className="text-sm text-muted-foreground">
              {formatOrderAmount(order.amountCents, order.currency)}
            </p>
            <p className="text-xs text-muted-foreground">
              Updated {new Date(order.updatedAt).toLocaleString()}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
          >
            {loading && <Loader2 className="size-4 animate-spin" data-icon="inline-start" />}
            {mode === "create" ? "Create order" : "Save changes"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full border-white/10"
            disabled={loading}
            render={<Link href="/admin/orders" />}
          >
            Cancel
          </Button>

          {mode === "edit" && (
            <Button
              type="button"
              variant="destructive"
              className="w-full"
              disabled={loading}
              onClick={handleDelete}
            >
              <Trash2 className="size-4" data-icon="inline-start" />
              Delete order
            </Button>
          )}
        </div>
      </aside>
    </form>
  );
}
