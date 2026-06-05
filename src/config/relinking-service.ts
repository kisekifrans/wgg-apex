export const relinkingServiceNotices = {
  problem: {
    title: "The linking conflict",
    description:
      'EA may show: "Your accounts can\'t be linked because the EA Account is already linked to another platform account. An EA Account can only be linked to one account per platform in its lifetime."',
  },
  successRate: {
    title: "Realistic expectations",
    description:
      "Our operators use a proven relink workflow with a strong track record. We do not advertise 100% success—outcomes depend on EA and platform policies.",
  },
  refundPolicy: {
    title: "Refund policy",
    description:
      "This service is non-refundable if the relink attempt fails after our operator has started work. Pay only when you accept these terms.",
    linkLabel: "Read full refund policy",
    linkHref: "/legal/refund-policy",
  },
} as const;

export const relinkingProcessSteps = [
  {
    step: "01",
    title: "Submit your details",
    description:
      "Share your EA account, the platform link to remove, and that platform's login details.",
  },
  {
    step: "02",
    title: "Operator review",
    description:
      "We verify the case context and confirm the relink path before starting.",
  },
  {
    step: "03",
    title: "Relink attempt",
    description:
      "A WGG operator runs the relink procedure and updates you via Discord.",
  },
] as const;
