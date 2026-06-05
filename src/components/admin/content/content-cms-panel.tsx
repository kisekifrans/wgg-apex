"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { saveSoldWebhookUrl } from "@/actions/admin/settings/discord-webhooks";
import { createCompletedBoost } from "@/actions/admin/content/completed-boosts";
import { createReview, deleteReview } from "@/actions/admin/content/reviews";
import { deleteCompletedBoost } from "@/actions/admin/content/completed-boosts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CompletedBoost } from "@/lib/db/completed-boosts";
import type { CustomerReview } from "@/lib/db/customer-reviews";

const SERVICE_TYPES = [
  "Ranked Boosting",
  "Predator Maintenance",
  "Badge Boosting",
  "Unban Service",
  "Duo Ranked Boost",
];

type ContentCmsPanelProps = {
  reviews: CustomerReview[];
  boosts: CompletedBoost[];
  soldWebhookUrl: string;
};

export function ContentCmsPanel({
  reviews,
  boosts,
  soldWebhookUrl,
}: ContentCmsPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-white/5 bg-card/40 p-6">
        <h2 className="font-heading text-lg font-semibold">
          Discord sold webhook
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Posts a SOLD embed when an admin marks a marketplace listing as sold.
        </p>
        <form
          className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end"
          action={async (fd) => {
            startTransition(async () => {
              const result = await saveSoldWebhookUrl(fd);
              if (!result.success) toast.error(result.error);
              else toast.success("Sold webhook saved");
              router.refresh();
            });
          }}
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Label htmlFor="soldWebhookUrl">Webhook URL</Label>
            <Input
              id="soldWebhookUrl"
              name="soldWebhookUrl"
              defaultValue={soldWebhookUrl}
              placeholder="https://discord.com/api/webhooks/..."
              className="border-white/10 bg-background/50"
            />
          </div>
          <Button type="submit" disabled={pending}>
            Save
          </Button>
        </form>
      </section>

      <section className="rounded-xl border border-white/5 bg-card/40 p-6">
        <h2 className="font-heading text-lg font-semibold">Add review</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          action={async (fd) => {
            startTransition(async () => {
              const result = await createReview(fd);
              if (!result.success) toast.error(result.error);
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer name</Label>
            <Input id="customerName" name="customerName" required className="border-white/10 bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serviceType">Service</Label>
            <select id="serviceType" name="serviceType" required className="field-select flex h-9 w-full rounded-lg border border-white/10 bg-background/50 px-3 text-sm">
              {SERVICE_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating (1–5)</Label>
            <Input id="rating" name="rating" type="number" min={1} max={5} defaultValue={5} required className="border-white/10 bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Profile image</Label>
            <Input id="avatar" name="avatar" type="file" accept="image/*" className="border-white/10 bg-background/50" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="reviewText">Review</Label>
            <Textarea id="reviewText" name="reviewText" rows={3} required className="border-white/10 bg-background/50" />
          </div>
          <Button type="submit" disabled={pending} className="sm:col-span-2">
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Add review
          </Button>
        </form>

        <ul className="mt-8 space-y-3">
          {reviews.map((r) => (
            <li key={r.id} className="flex items-start justify-between gap-4 rounded-lg border border-white/10 px-4 py-3">
              <div>
                <p className="font-medium">{r.customerName} · {r.rating}★</p>
                <p className="text-xs text-muted-foreground">{r.serviceType}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{r.reviewText}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteReview(r.id);
                    if (!result.success) toast.error(result.error);
                    else router.refresh();
                  })
                }
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-white/5 bg-card/40 p-6">
        <h2 className="font-heading text-lg font-semibold">Add completed boost</h2>
        <form
          className="mt-4 grid gap-4 sm:grid-cols-2"
          action={async (fd) => {
            startTransition(async () => {
              const result = await createCompletedBoost(fd);
              if (!result.success) toast.error(result.error);
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="fromRank">Starting rank</Label>
            <Input id="fromRank" name="fromRank" required placeholder="Bronze" className="border-white/10 bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="toRank">Ending rank</Label>
            <Input id="toRank" name="toRank" required placeholder="Gold" className="border-white/10 bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="completedAt">Completion date</Label>
            <Input id="completedAt" name="completedAt" type="date" required className="border-white/10 bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="screenshot">Screenshot</Label>
            <Input id="screenshot" name="screenshot" type="file" accept="image/*" required className="border-white/10 bg-background/50" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" name="description" className="border-white/10 bg-background/50" />
          </div>
          <Button type="submit" disabled={pending} className="sm:col-span-2">
            Add boost
          </Button>
        </form>

        <ul className="mt-8 space-y-3">
          {boosts.map((b) => (
            <li key={b.id} className="flex items-start justify-between gap-4 rounded-lg border border-white/10 px-4 py-3">
              <div>
                <p className="font-medium">{b.fromRank} → {b.toRank}</p>
                <p className="text-xs text-muted-foreground">{b.completedAt}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteCompletedBoost(b.id);
                    if (!result.success) toast.error(result.error);
                    else router.refresh();
                  })
                }
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
