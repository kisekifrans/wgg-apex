import Link from "next/link";
import { AlertTriangle, Link2, ShieldAlert } from "lucide-react";

import { relinkingServiceNotices } from "@/config/relinking-service";

const cards = [
  {
    icon: Link2,
    ...relinkingServiceNotices.problem,
    tone: "border-white/10 bg-white/[0.02]",
  },
  {
    icon: ShieldAlert,
    ...relinkingServiceNotices.successRate,
    tone: "border-primary/20 bg-primary/5",
  },
  {
    icon: AlertTriangle,
    ...relinkingServiceNotices.refundPolicy,
    tone: "border-amber-500/20 bg-amber-500/5",
    link: relinkingServiceNotices.refundPolicy,
  },
] as const;

export function RelinkingNoticeCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.title}
          className={`rounded-xl border p-5 ${card.tone}`}
        >
          <card.icon className="size-5 text-primary" aria-hidden />
          <h3 className="mt-3 font-medium">{card.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {card.description}
          </p>
          {"link" in card && card.link ? (
            <Link
              href={card.link.linkHref}
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              {card.link.linkLabel}
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}
