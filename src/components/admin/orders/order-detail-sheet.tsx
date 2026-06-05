"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ExternalLink,
  Loader2,
  Mail,
  MessageCircle,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";

import { updateOrderNotes } from "@/actions/admin/orders/orders";
import { OrderInlineSelect } from "@/components/admin/orders/order-inline-select";
import { OrderPaymentStatusBadge } from "@/components/admin/orders/order-payment-status-badge";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { ORDER_TYPE_LABELS } from "@/config/orders";
import { formatOrderAmount } from "@/lib/orders/format";
import type { ServiceOrder } from "@/types/orders";

function serviceSummary(order: ServiceOrder): string {
  if (
    order.orderType === "ranked_boost" ||
    order.orderType === "self_play_boost"
  ) {
    return [order.currentRank, order.targetRank].filter(Boolean).join(" → ") || "—";
  }
  if (order.orderType === "badge_boost") {
    return order.serviceDetail ?? "—";
  }
  if (order.orderType === "predator_maintenance") {
    return [order.currentRank, order.serviceDetail].filter(Boolean).join(" · ") || "—";
  }
  return "Unban case";
}

type OrderDetailSheetProps = {
  order: ServiceOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function OrderNotesEditor({
  orderId,
  initialNotes,
}: {
  orderId: string;
  initialNotes: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [savingNotes, startSaveNotes] = useTransition();

  function saveNotes() {
    startSaveNotes(async () => {
      const result = await updateOrderNotes(orderId, notes);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Notes saved");
      router.refresh();
    });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <StickyNote className="size-4 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Notes
        </h3>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={6}
        placeholder="Operator notes, platform, deadlines…"
        className="border-white/10 bg-background/50"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={savingNotes}
        onClick={saveNotes}
      >
        {savingNotes ? (
          <>
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
            Saving…
          </>
        ) : (
          "Save notes"
        )}
      </Button>
    </section>
  );
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
}: OrderDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-white/5 bg-[#0c0c0c] sm:max-w-md"
      >
        {order && (
          <>
            <SheetHeader className="border-b border-white/5 pb-4">
              <p className="font-mono text-xs text-primary">{order.orderNumber}</p>
              <SheetTitle className="font-heading text-left">
                {ORDER_TYPE_LABELS[order.orderType]}
              </SheetTitle>
              <SheetDescription className="text-left">
                Created {new Date(order.createdAt).toLocaleString()}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6">
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Customer
                </h3>
                <div className="space-y-3 rounded-xl border border-white/5 bg-card/40 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-white/5 bg-primary/10 p-2">
                      <MessageCircle className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Discord</p>
                      <p className="truncate font-medium">{order.customerDiscord}</p>
                    </div>
                  </div>
                  {order.customerEmail && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-white/5 bg-white/5 p-2">
                        <Mail className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="truncate text-sm">{order.customerEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {order.orderType === "predator_maintenance" &&
                order.metadata?.predator && (
                  <section className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Account credentials
                    </h3>
                    <dl className="space-y-2 rounded-xl border border-white/5 bg-card/40 p-4 text-sm">
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Nintendo email
                        </dt>
                        <dd>{order.metadata.predator.nintendoEmail}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Nintendo password
                        </dt>
                        <dd className="font-mono text-xs">
                          {order.metadata.predator.nintendoPassword}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Nintendo backup code
                        </dt>
                        <dd className="font-mono text-xs">
                          {order.metadata.predator.nintendoBackupCode}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          EA email
                        </dt>
                        <dd>{order.metadata.predator.eaEmail}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          EA password
                        </dt>
                        <dd className="font-mono text-xs">
                          {order.metadata.predator.eaPassword}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          EA backup code
                        </dt>
                        <dd className="font-mono text-xs">
                          {order.metadata.predator.eaBackupCode}
                        </dd>
                      </div>
                    </dl>
                  </section>
                )}

              {order.orderType === "unban_service" && order.metadata?.unban && (
                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Unban case
                  </h3>
                  <dl className="space-y-2 rounded-xl border border-white/5 bg-card/40 p-4 text-sm">
                    {order.metadata.unban.eaLoginId && (
                      <div>
                        <dt className="text-xs text-muted-foreground">EA Login ID</dt>
                        <dd className="font-medium">{order.metadata.unban.eaLoginId}</dd>
                      </div>
                    )}
                    {order.metadata.unban.eaEmail && (
                      <div>
                        <dt className="text-xs text-muted-foreground">EA Email</dt>
                        <dd>{order.metadata.unban.eaEmail}</dd>
                      </div>
                    )}
                    {order.metadata.unban.banDate && (
                      <div>
                        <dt className="text-xs text-muted-foreground">Ban date</dt>
                        <dd>{order.metadata.unban.banDate}</dd>
                      </div>
                    )}
                    {order.metadata.unban.previousAppeals && (
                      <div>
                        <dt className="text-xs text-muted-foreground">Previous appeals</dt>
                        <dd className="text-muted-foreground">
                          {order.metadata.unban.previousAppeals}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>
              )}

              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Service
                </h3>
                <div className="rounded-xl border border-white/5 bg-card/40 p-4 text-sm">
                  <p className="font-medium">{serviceSummary(order)}</p>
                  <p className="mt-2 font-mono text-lg font-semibold text-primary">
                    {formatOrderAmount(order.amountCents, order.currency)}
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <OrderPaymentStatusBadge status={order.paymentStatus} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Order status
                    </Label>
                    <OrderInlineSelect
                      orderId={order.id}
                      field="status"
                      value={order.status}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Payment
                    </Label>
                    <OrderInlineSelect
                      orderId={order.id}
                      field="payment"
                      value={order.paymentStatus}
                    />
                  </div>
                </div>
              </section>

              <OrderNotesEditor
                key={order.id}
                orderId={order.id}
                initialNotes={order.notes ?? ""}
              />

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-[var(--brand-orange-deep)]"
                render={<Link href={`/admin/orders/${order.id}`} />}
              >
                <ExternalLink className="size-4" data-icon="inline-start" />
                Open full editor
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
