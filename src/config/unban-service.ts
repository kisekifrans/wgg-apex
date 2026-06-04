export const unbanServiceNotices = {
  successRate: {
    title: "Screened case success rate",
    value: "68–74%",
    description:
      "Among accounts that pass our eligibility screening and complete the guided appeal workflow. Not a guarantee of reinstatement—EA makes the final decision.",
    footnote:
      "Based on WGG operator-reported outcomes for qualifying cases, 2024–2026.",
  },
  processingTime: {
    title: "Typical processing time",
    value: "5–14 days",
    description:
      "Business days after payment confirmation. Complex histories or additional EA requests may extend timelines—we document every milestone.",
  },
  refundPolicy: {
    title: "Non-refundable service fee",
    description:
      "The case review and operational workflow fee is non-refundable once work begins. If screening determines your account is ineligible before substantive work starts, refund terms in our policy may apply.",
    linkLabel: "Read full refund policy",
    linkHref: "/legal/refund-policy",
  },
} as const;

export const unbanProcessSteps = [
  {
    step: "01",
    title: "Submit Case Details",
    description:
      "Provide EA credentials context, ban timeline, and prior appeal history for operator screening.",
  },
  {
    step: "02",
    title: "Eligibility Review",
    description:
      "Operators assess enforcement type and documentation requirements before substantive case work.",
  },
  {
    step: "03",
    title: "Guided Workflow",
    description:
      "Structured submission support with timeline notes—no false guarantees, clear updates every step.",
  },
] as const;
