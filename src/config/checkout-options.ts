export const CHECKOUT_PLATFORMS = [
  { value: "pc", label: "PC (Origin / Steam)" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "switch", label: "Nintendo Switch" },
] as const;

export type CheckoutPlatform = (typeof CHECKOUT_PLATFORMS)[number]["value"];

export const CHECKOUT_PRIORITIES = [
  {
    value: "standard",
    label: "Standard",
    description: "Normal queue placement",
    multiplier: 1,
  },
  {
    value: "express",
    label: "Express",
    description: "Priority queue — 20% faster target",
    multiplier: 1.2,
  },
] as const;

export type CheckoutPriority = (typeof CHECKOUT_PRIORITIES)[number]["value"];

export function getPlatformLabel(value: string): string {
  return (
    CHECKOUT_PLATFORMS.find((p) => p.value === value)?.label ?? value
  );
}

export function getPriorityLabel(value: string): string {
  return (
    CHECKOUT_PRIORITIES.find((p) => p.value === value)?.label ?? value
  );
}

export function getPriorityMultiplier(value: string): number {
  return (
    CHECKOUT_PRIORITIES.find((p) => p.value === value)?.multiplier ?? 1
  );
}
