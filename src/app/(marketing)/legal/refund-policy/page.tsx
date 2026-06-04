import { LegalPageLayout } from "@/components/marketing/legal-page-layout";
import { legalLastUpdated } from "@/config/legal";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Refund Policy",
  description: `Refund and cancellation terms for ${siteConfig.name} services and marketplace purchases.`,
};

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      title="Refund Policy"
      description="Clear expectations for refunds across boosting, maintenance, badges, unban screening, and marketplace orders."
      lastUpdated={legalLastUpdated}
    >
      <section className="space-y-4">
        <h2>1. General principle</h2>
        <p>
          {siteConfig.name} delivers operator-led digital services. Because work
          can begin soon after payment, refunds are evaluated per service type
          and order status. Contact{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>{" "}
          before initiating a payment dispute so we can resolve issues directly.
        </p>
      </section>

      <section className="space-y-4">
        <h2>2. Ranked boosting & Predator maintenance</h2>
        <ul>
          <li>
            <strong className="text-foreground">Before work starts</strong> — If
            no operator has begun your order and you cancel within 24 hours of
            payment, you may qualify for a full refund minus payment processing
            fees where applicable.
          </li>
          <li>
            <strong className="text-foreground">After work starts</strong> —
            Partial refunds may be offered based on documented progress at our
            discretion. Completed or substantially completed orders are not
            refundable.
          </li>
          <li>
            <strong className="text-foreground">Service issues</strong> — If we
            fail to deliver per the confirmed quote (e.g. no meaningful progress
            within the stated ETA window), contact support for remediation or
            partial credit.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2>3. Badge services</h2>
        <p>
          Badge orders use fixed catalog pricing. Once an operator has started
          achievement work, the order fee is non-refundable. If we determine a
          badge path is infeasible before work begins, we will offer a full
          refund or alternative quote.
        </p>
      </section>

      <section className="space-y-4">
        <h2>4. Apex unban service</h2>
        <p>
          Unban support includes eligibility screening and a guided operational
          workflow. EA makes all final enforcement decisions; we do not guarantee
          reinstatement.
        </p>
        <ul>
          <li>
            <strong className="text-foreground">Ineligible at screening</strong>{" "}
            — If operators determine your case does not meet minimum eligibility
            criteria before substantive case work begins, you may receive a full
            refund of the service fee.
          </li>
          <li>
            <strong className="text-foreground">After work begins</strong> — The
            case review and workflow fee is non-refundable once substantive
            operator work has started, including documentation, timeline logging,
            and submission guidance.
          </li>
        </ul>
        <p>
          This aligns with the notice shown on our{" "}
          <a href="/services/apex-unban">Apex Unban Service</a> page.
        </p>
      </section>

      <section className="space-y-4">
        <h2>5. Account marketplace</h2>
        <ul>
          <li>
            Marketplace listings are unique digital goods. All sales are final
            once credentials or transfer steps are delivered, except where a
            listing was materially misrepresented in rank, platform, or access
            details verified at purchase.
          </li>
          <li>
            Report access or disclosure issues within 48 hours of delivery with
            evidence. We will investigate and may offer replacement support or
            refund at our discretion.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2>6. Chargebacks</h2>
        <p>
          Unauthorized chargebacks on completed or in-progress orders may result
          in permanent suspension from {siteConfig.name}. Always contact support
          first—we log order timelines and operator notes to resolve disputes
          fairly.
        </p>
      </section>

      <section className="space-y-4">
        <h2>7. How to request a refund</h2>
        <ol>
          <li>
            Email{" "}
            <a href={`mailto:${siteConfig.supportEmail}`}>
              {siteConfig.supportEmail}
            </a>{" "}
            with your order reference (e.g. WGG order number or Stripe receipt).
          </li>
          <li>Describe the issue and whether work has started on your order.</li>
          <li>Allow up to 5 business days for review and response.</li>
        </ol>
        <p>
          Approved refunds are issued to the original payment method via Stripe
          where possible.
        </p>
      </section>

      <section className="space-y-4">
        <h2>8. Related policies</h2>
        <p>
          See our <a href="/legal/terms">Terms of Service</a> and{" "}
          <a href="/legal/privacy">Privacy Policy</a> for additional context.
        </p>
      </section>
    </LegalPageLayout>
  );
}
