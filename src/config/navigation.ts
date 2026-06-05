export const marketingNav = [
  { label: "Services", href: "#services" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "#faq" },
] as const;

export const discordNavItem = { label: "Discord", href: "#discord" } as const;

export const footerLinks = {
  services: [
    { label: "Ranked Boosting", href: "#rank-pricing" },
    { label: "Predator Maintenance", href: "/services/predator-maintenance" },
    { label: "Duo Ranked Boost", href: "#self-play-boosting" },
    { label: "Badge Boosting", href: "#badges" },
    { label: "Unban Service", href: "/services/apex-unban" },
    { label: "Account Marketplace", href: "/marketplace" },
  ],
  company: [
    { label: "Why WGG", href: "#why-wgg" },
    { label: "Process", href: "#process" },
    { label: "My Orders", href: "/account/login" },
    { label: "Track Order", href: "/track-order" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "mailto:support@wggapex.com" },
  ],
  legal: [
    { label: "Terms", href: "/legal/terms" },
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Refund Policy", href: "/legal/refund-policy" },
  ],
} as const;
