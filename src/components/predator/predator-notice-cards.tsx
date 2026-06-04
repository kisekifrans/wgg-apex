import { Gamepad2, KeyRound, Shield } from "lucide-react";

import { predatorServiceNotices } from "@/config/predator-maintenance";

const notices = [
  {
    icon: Gamepad2,
    title: "Nintendo Platform",
    text: predatorServiceNotices.platform,
  },
  {
    icon: Shield,
    title: "Nintendo Account Required",
    text: predatorServiceNotices.nintendoAccount,
  },
  {
    icon: KeyRound,
    title: "Backup Codes",
    text: `${predatorServiceNotices.nintendoBackup} ${predatorServiceNotices.eaCredentials}`,
  },
] as const;

export function PredatorNoticeCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {notices.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="rounded-xl border border-white/5 bg-card/40 p-5"
          >
            <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-primary">
              <Icon className="size-5" aria-hidden />
            </div>
            <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
