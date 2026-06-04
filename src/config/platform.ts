import {
  BadgeCheck,
  Crown,
  ShieldCheck,
  ShoppingBag,
  Trophy,
  Unlock,
  type LucideIcon,
} from "lucide-react";

export type PlatformService = {
  slug: string;
  name: string;
  description: string;
  fromPrice: number | null;
  priceLabel?: string;
  icon: LucideIcon;
  href: string;
};

export const platformServices: PlatformService[] = [
  {
    slug: "ranked-boosting",
    name: "Ranked Boosting",
    description:
      "Structured rank progression from current tier to target division with live tracking and verified boosters.",
    fromPrice: 49,
    icon: Trophy,
    href: "#rank-pricing",
  },
  {
    slug: "predator-maintenance",
    name: "Predator Maintenance",
    description:
      "Retain Predator RP with scheduled sessions, performance reporting, and priority queue placement.",
    fromPrice: 199,
    priceLabel: "/ week",
    icon: Crown,
    href: "#rank-pricing",
  },
  {
    slug: "badge-boosting",
    name: "Badge Boosting",
    description:
      "Achievement and badge completion with fixed catalog pricing—no quote surprises.",
    fromPrice: 39,
    icon: BadgeCheck,
    href: "#badges",
  },
  {
    slug: "apex-unban",
    name: "Apex Unban Service",
    description:
      "Case review and guided recovery workflow for suspended accounts, with clear eligibility screening.",
    fromPrice: 149,
    icon: Unlock,
    href: "#unban",
  },
  {
    slug: "account-marketplace",
    name: "Account Marketplace",
    description:
      "Verified listings with rank, RP, and heirloom disclosure—purchased through secure escrow checkout.",
    fromPrice: null,
    priceLabel: "Listings vary",
    icon: ShoppingBag,
    href: "#accounts",
  },
];

export const whyWggItems = [
  {
    title: "Built for competitive players",
    description:
      "Workflows designed around ranked integrity, Predator schedules, and high-stakes account decisions—not casual boosting ads.",
  },
  {
    title: "SaaS-grade transparency",
    description:
      "Server-validated quotes, order timelines, and Stripe checkout. You always know what you paid for and where things stand.",
  },
  {
    title: "Human operations layer",
    description:
      "Every order and listing is reviewed by operators before work begins. No anonymous handoffs or unclear status black holes.",
  },
  {
    title: "Trust by design",
    description:
      "SSL encryption, published policies, and support response targets. We optimize for retention, not one-off transactions.",
  },
] as const;

export type RankPricingRow = {
  tier: string;
  divisions: string;
  fromPrice: number;
  eta: string;
};

export const rankPricingTiers: RankPricingRow[] = [
  { tier: "Bronze", divisions: "IV → I", fromPrice: 49, eta: "2–4 days" },
  { tier: "Silver", divisions: "IV → I", fromPrice: 59, eta: "2–4 days" },
  { tier: "Gold", divisions: "IV → I", fromPrice: 69, eta: "3–5 days" },
  { tier: "Platinum", divisions: "IV → I", fromPrice: 89, eta: "3–6 days" },
  { tier: "Diamond", divisions: "IV → I", fromPrice: 119, eta: "4–7 days" },
  { tier: "Master", divisions: "Divisions", fromPrice: 159, eta: "5–9 days" },
  { tier: "Predator", divisions: "RP maintenance", fromPrice: 199, eta: "Weekly" },
];

export const predatorMaintenancePlans = [
  {
    name: "Core",
    price: 199,
    period: "per week",
    features: [
      "Minimum RP floor maintenance",
      "Weekly progress report",
      "Standard queue",
    ],
  },
  {
    name: "Pro",
    price: 349,
    period: "per week",
    featured: true,
    features: [
      "Aggressive RP target band",
      "Daily status updates",
      "Priority queue + duo option",
    ],
  },
  {
    name: "Elite",
    price: 549,
    period: "per week",
    features: [
      "Custom RP schedule",
      "Dedicated operator channel",
      "Express recovery sessions",
    ],
  },
] as const;

export type BadgeService = {
  name: string;
  price: number;
  difficulty: "Standard" | "Advanced" | "Elite";
};

export const badgeServices: BadgeService[] = [
  { name: "Apex Predator Badge", price: 89, difficulty: "Advanced" },
  { name: "4000 Damage Badge", price: 65, difficulty: "Standard" },
  { name: "20 Kill Badge", price: 120, difficulty: "Elite" },
  { name: "Legend-Specific Master", price: 75, difficulty: "Standard" },
  { name: "Ranked Arena Badge", price: 95, difficulty: "Advanced" },
  { name: "Event Collection Badge", price: 55, difficulty: "Standard" },
];

export const unbanFeatures = [
  "Initial eligibility review before payment",
  "Documented case timeline in your dashboard",
  "Operator-guided submission workflow",
  "Clear refund terms if case is ineligible",
] as const;

export type FeaturedAccount = {
  id: string;
  title: string;
  rank: string;
  rp: string;
  platform: "PC" | "PlayStation" | "Xbox";
  price: number;
  tags: string[];
  verified: boolean;
};

export const featuredAccounts: FeaturedAccount[] = [
  {
    id: "acc-001",
    title: "Master · Heirloom",
    rank: "Master",
    rp: "18,400 RP",
    platform: "PC",
    price: 420,
    tags: ["Heirloom", "OG badges"],
    verified: true,
  },
  {
    id: "acc-002",
    title: "Diamond IV · Starter",
    rank: "Diamond IV",
    rp: "9,200 RP",
    platform: "PlayStation",
    price: 185,
    tags: ["Clean history", "Rank-ready"],
    verified: true,
  },
  {
    id: "acc-003",
    title: "Predator · Season ready",
    rank: "Predator",
    rp: "22,100 RP",
    platform: "PC",
    price: 890,
    tags: ["Predator", "Multiple legends"],
    verified: true,
  },
];

export const customerProcessSteps = [
  {
    step: "01",
    title: "Select your service",
    description:
      "Choose ranked boosting, Predator maintenance, badges, unban support, or browse verified account listings.",
  },
  {
    step: "02",
    title: "Configure & review quote",
    description:
      "Complete the structured form. Pricing is calculated server-side before you commit—no checkout surprises.",
  },
  {
    step: "03",
    title: "Secure checkout",
    description:
      "Pay through Stripe with card or wallet options. Your order is logged instantly with a trackable reference.",
  },
  {
    step: "04",
    title: "Track & complete",
    description:
      "Follow status updates in your dashboard. Operators post milestones until your order is completed or delivered.",
  },
] as const;

export const faqItems = [
  {
    question: "Is WGG Apex only a boosting website?",
    answer:
      "No. WGG Apex is a services platform for competitive players—covering ranked boosting, Predator maintenance, badge completion, unban case support, and a verified account marketplace.",
  },
  {
    question: "How does Predator maintenance work?",
    answer:
      "You select a weekly plan with an RP target band. Our operators schedule sessions, report progress, and adjust tactics to keep your account within the agreed Predator range.",
  },
  {
    question: "Are marketplace accounts verified?",
    answer:
      "Listings pass operator review for rank, RP, platform, and disclosure requirements before publication. Purchase through our secure checkout with escrow-style fulfillment.",
  },
  {
    question: "What is the unban service?",
    answer:
      "We provide eligibility screening and a guided case workflow. Outcomes depend on platform enforcement policies—we set expectations upfront and document every step.",
  },
  {
    question: "How is pricing determined for rank boosts?",
    answer:
      "Quotes are based on your current tier, target tier, platform, and priority options. Published tier tables show starting rates; your final quote is confirmed before payment.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Stripe powers all payments—major cards and digital wallets where supported. We never store card data on WGG servers.",
  },
] as const;
