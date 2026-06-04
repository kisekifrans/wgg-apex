import {
  BadgeCheck,
  Crown,
  Package,
  ShoppingBag,
  Trophy,
  Unlock,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  trophy: Trophy,
  crown: Crown,
  "badge-check": BadgeCheck,
  unlock: Unlock,
  "shopping-bag": ShoppingBag,
  package: Package,
};

export function getServiceIcon(key: string): LucideIcon {
  return iconMap[key] ?? Package;
}

export const SERVICE_ICON_OPTIONS = Object.keys(iconMap);
