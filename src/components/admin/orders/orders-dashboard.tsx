"use client";

import { useMemo, useState } from "react";
import {
  MessageCircle,
  MoreHorizontal,
  StickyNote,
} from "lucide-react";

import { OrderDetailSheet } from "@/components/admin/orders/order-detail-sheet";
import { OrderInlineSelect } from "@/components/admin/orders/order-inline-select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORDER_TYPE_LABELS } from "@/config/orders";
import { formatOrderAmount } from "@/lib/orders/format";
import { cn } from "@/lib/utils";
import type { ServiceOrder } from "@/types/orders";

function rankSummary(order: ServiceOrder): string {
  if (
    order.orderType === "ranked_boost" ||
    order.orderType === "self_play_boost"
  ) {
    if (order.currentRank && order.targetRank) {
      return `${order.currentRank} → ${order.targetRank}`;
    }
    return order.currentRank ?? order.targetRank ?? "—";
  }
  if (order.orderType === "badge_boost") {
    return order.serviceDetail ?? order.currentRank ?? "—";
  }
  if (order.orderType === "predator_maintenance") {
    return [order.currentRank, order.serviceDetail].filter(Boolean).join(" · ") || "—";
  }
  return "—";
}

type OrdersDashboardProps = {
  orders: ServiceOrder[];
};

export function OrdersDashboard({ orders }: OrdersDashboardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedId) ?? null,
    [orders, selectedId]
  );

  function openOrder(order: ServiceOrder) {
    setSelectedId(order.id);
    setSheetOpen(true);
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-card/30 px-6 py-20 text-center">
        <p className="font-heading text-lg font-medium">No orders match</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Adjust filters or create a new service order.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-white/5 bg-card/30 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 bg-white/[0.02] hover:bg-white/[0.02]">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Order
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Customer
              </TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground md:table-cell">
                Service
              </TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:table-cell">
                Notes
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amount
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:table-cell">
                Payment
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                className={cn(
                  "cursor-pointer border-white/5 transition-colors",
                  "hover:bg-white/[0.03]",
                  selectedId === order.id && "bg-primary/5"
                )}
                onClick={() => openOrder(order)}
              >
                <TableCell className="align-top">
                  <div className="font-mono text-xs text-primary/90">
                    {order.orderNumber}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground md:hidden">
                    {ORDER_TYPE_LABELS[order.orderType]}
                  </div>
                </TableCell>

                <TableCell className="align-top">
                  <div className="flex items-start gap-2">
                    <MessageCircle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {order.customerDiscord}
                      </p>
                      {order.customerEmail && (
                        <p className="truncate text-xs text-muted-foreground">
                          {order.customerEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="hidden align-top md:table-cell">
                  <p className="text-sm">{ORDER_TYPE_LABELS[order.orderType]}</p>
                  <p className="mt-0.5 max-w-[200px] truncate text-xs text-muted-foreground">
                    {rankSummary(order)}
                  </p>
                </TableCell>

                <TableCell className="hidden max-w-[200px] align-top lg:table-cell">
                  {order.notes ? (
                    <div
                      className="flex items-start gap-1.5 text-left"
                      title={order.notes}
                    >
                      <StickyNote className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                      <span className="line-clamp-2 text-xs text-muted-foreground">
                        {order.notes}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </TableCell>

                <TableCell className="align-top font-mono text-sm tabular-nums">
                  {formatOrderAmount(order.amountCents, order.currency)}
                </TableCell>

                <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
                  <OrderInlineSelect
                    orderId={order.id}
                    field="status"
                    value={order.status}
                  />
                </TableCell>

                <TableCell
                  className="hidden align-top sm:table-cell"
                  onClick={(e) => e.stopPropagation()}
                >
                  <OrderInlineSelect
                    orderId={order.id}
                    field="payment"
                    value={order.paymentStatus}
                  />
                </TableCell>

                <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => openOrder(order)}
                    aria-label="View details"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <OrderDetailSheet
        order={selectedOrder}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
