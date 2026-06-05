import {
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  MessageSquare,
  ClipboardList,
  Star,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const adminNavItems: AdminNavItem[] = [
  {
    title: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    description: "KPIs and recent activity",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ClipboardList,
    description: "Order queue and fulfillment",
  },
  {
    title: "Services",
    href: "/admin/services",
    icon: Package,
    description: "Catalog and pricing",
  },
  {
    title: "Account Marketplace",
    href: "/admin/marketplace",
    icon: ShoppingBag,
    description: "Listings and verification",
  },
  {
    title: "Discord Tools",
    href: "/admin/discord",
    icon: MessageSquare,
    description: "Integrations and notifications",
  },
  {
    title: "Content",
    href: "/admin/content",
    icon: Star,
    description: "Reviews, boosts, sold webhook",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    description: "Platform configuration",
  },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
