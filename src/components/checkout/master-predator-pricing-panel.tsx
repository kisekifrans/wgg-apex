import { MASTER_PREDATOR_PLATFORMS } from "@/config/master-predator-pricing";
import { formatPriceFromCents } from "@/lib/services/format-price";

type MasterPredatorPricingPanelProps = {
  duoBoost?: boolean;
  selectedPlatform?: string;
};

export function MasterPredatorPricingPanel({
  duoBoost = false,
  selectedPlatform,
}: MasterPredatorPricingPanelProps) {
  return (
    <section className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
      <h2 className="font-heading text-lg font-semibold">
        Master → Predator pricing
      </h2>
      <p className="text-sm text-muted-foreground">
        Final price depends on your platform. Xbox is our default rate; PC and
        PlayStation are priced higher due to queue difficulty and operator
        availability.
        {duoBoost ? " Duo boost is 2× the rates below." : ""}
      </p>
      <ul className="grid gap-2 sm:grid-cols-3">
        {MASTER_PREDATOR_PLATFORMS.map((row) => {
          const cents = duoBoost ? row.cents * 2 : row.cents;
          const isSelected = selectedPlatform === row.value;
          return (
            <li
              key={row.value}
              className={`rounded-lg border px-3 py-2.5 text-sm ${
                isSelected
                  ? "border-primary/40 bg-primary/10"
                  : "border-white/10 bg-background/30"
              }`}
            >
              <p className="font-medium">{row.label}</p>
              <p className="mt-0.5 font-mono font-semibold tabular-nums">
                {formatPriceFromCents(cents)}
              </p>
              {row.value === "xbox" && (
                <p className="mt-1 text-xs text-primary">Default</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
