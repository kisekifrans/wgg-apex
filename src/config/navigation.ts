export const marketingNav = [
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#rank-pricing" },
  { label: "Process", href: "#process" },
  { label: "FAQ", href: "#faq" },
] as const;

export const footerLinks = {
  services: [
    { label: "Ranked Boosting", href: "#rank-pricing" },
    { label: "Predator Maintenance", href: "#rank-pricing" },
    { label: "Badge Boosting", href: "#badges" },
    { label: "Unban Service", href: "#unban" },
    { label: "Account Marketplace", href: "#accounts" },
  ],
  company: [
    { label: "Why WGG", href: "#why-wgg" },
    { label: "Process", href: "#process" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "mailto:support@wggapex.com" },
  ],
  legal: [
    { label: "Terms", href: "/legal/terms" },
    { label: "Privacy", href: "/legal/privacy" },
    { label: "Refund policy", href: "/legal/refund-policy" },
  ],
} as const;
