/** Marketing copy without prices — pricing lives in Supabase `services` catalog */

export const whyWggItems = [
  {
    title: "No cheats — professional operators only",
    description:
      "We never use cheats, exploits, or third-party tools on your account. Work is done by professional players who have completed thousands of ranked boosts and account deliveries.",
  },
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
