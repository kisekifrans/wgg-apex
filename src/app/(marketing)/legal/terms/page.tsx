import { LegalPageLayout } from "@/components/marketing/legal-page-layout";
import { legalLastUpdated } from "@/config/legal";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Terms of Service",
  description: `Terms governing use of ${siteConfig.name} services, checkout, and platform access.`,
};

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      description={`These terms govern your use of ${siteConfig.name}, including ranked services, marketplace listings, and account recovery support.`}
      lastUpdated={legalLastUpdated}
    >
      <section className="space-y-4">
        <h2>1. Agreement</h2>
        <p>
          By accessing {siteConfig.name}, creating an account, or purchasing a
          service, you agree to these Terms of Service and our Privacy Policy. If
          you do not agree, do not use the platform.
        </p>
        <p>
          We may update these terms from time to time. Material changes will be
          reflected on this page with an updated date. Continued use after
          changes constitutes acceptance.
        </p>
      </section>

      <section className="space-y-4">
        <h2>2. Services</h2>
        <p>
          {siteConfig.name} provides operational services for Apex Legends
          players, including ranked progression support, Predator maintenance,
          badge completion, account marketplace transactions, and guided unban
          case workflows.
        </p>
        <ul>
          <li>
            We do not guarantee specific in-game outcomes, rank results, or
            publisher enforcement decisions.
          </li>
          <li>
            You are responsible for accurate order information (platform, ranks,
            account context, and contact details).
          </li>
          <li>
            Services may require temporary account access or coordination as
            described at checkout—only provide credentials through approved
            secure channels when explicitly required.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2>3. Eligibility</h2>
        <p>
          You must be at least 18 years old (or the age of majority in your
          jurisdiction) to purchase services. You represent that you have the
          legal right to use and authorize work on any account submitted to us.
        </p>
      </section>

      <section className="space-y-4">
        <h2>4. Payments</h2>
        <p>
          Prices shown on the site are starting rates or catalog prices unless
          otherwise stated. Final quotes are confirmed before Stripe checkout.
          Payments are processed by Stripe; we do not store full card details on
          our servers.
        </p>
        <p>
          Refunds are governed by our{" "}
          <a href="/legal/refund-policy">Refund Policy</a>. Chargebacks without
          contacting support first may result in account suspension and order
          cancellation.
        </p>
      </section>

      <section className="space-y-4">
        <h2>5. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Submit false, stolen, or unauthorized account information.</li>
          <li>Abuse operators, support staff, or automated systems.</li>
          <li>Attempt to circumvent pricing, access controls, or security measures.</li>
          <li>Use the platform for unlawful purposes or to harm third parties.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2>6. Third parties</h2>
        <p>
          {siteConfig.name} is not affiliated with, endorsed by, or sponsored by
          Electronic Arts, Respawn Entertainment, or platform holders. Game marks
          and assets belong to their respective owners.
        </p>
      </section>

      <section className="space-y-4">
        <h2>7. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {siteConfig.name} and its
          operators are not liable for indirect, incidental, or consequential
          damages arising from service use, including account sanctions, data
          loss, or lost gameplay progress. Our total liability for any claim is
          limited to the amount you paid for the specific order giving rise to
          the claim.
        </p>
      </section>

      <section className="space-y-4">
        <h2>8. Contact</h2>
        <p>
          For terms-related questions, email{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </section>
    </LegalPageLayout>
  );
}
