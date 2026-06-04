import { LegalPageLayout } from "@/components/marketing/legal-page-layout";
import { legalLastUpdated } from "@/config/legal";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your personal information.`,
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      description={`How ${siteConfig.name} handles personal data when you browse, sign in, or purchase services.`}
      lastUpdated={legalLastUpdated}
    >
      <section className="space-y-4">
        <h2>1. Overview</h2>
        <p>
          We collect only the information needed to operate the platform, process
          orders, communicate about your services, and maintain security. We do
          not sell your personal data.
        </p>
      </section>

      <section className="space-y-4">
        <h2>2. Information we collect</h2>
        <h3>Information you provide</h3>
        <ul>
          <li>Account email and authentication data (admin sign-in).</li>
          <li>
            Order details: Discord handle, rank targets, service notes, and
            case-specific fields (e.g. unban intake).
          </li>
          <li>Support correspondence.</li>
        </ul>
        <h3>Information collected automatically</h3>
        <ul>
          <li>Device and browser metadata, IP address, and request logs.</li>
          <li>Session cookies required for authentication.</li>
          <li>Checkout and webhook metadata from Stripe (payment status, not full card numbers).</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2>3. How we use information</h2>
        <ul>
          <li>Fulfill and track service orders.</li>
          <li>Process payments and prevent fraud.</li>
          <li>Respond to support requests and operational updates.</li>
          <li>Improve platform security, reliability, and product experience.</li>
          <li>Comply with legal obligations.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2>4. Sharing</h2>
        <p>We may share data with:</p>
        <ul>
          <li>
            <strong className="text-foreground">Service providers</strong> — e.g.
            Supabase (hosting/database), Stripe (payments), and infrastructure
            vendors under contractual confidentiality obligations.
          </li>
          <li>
            <strong className="text-foreground">Operators</strong> — vetted staff
            who need order details to deliver your service.
          </li>
          <li>
            <strong className="text-foreground">Legal requirements</strong> — when
            required by law or to protect rights, safety, and platform integrity.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2>5. Retention & security</h2>
        <p>
          We retain order and account data for as long as needed to provide
          services, meet legal requirements, and resolve disputes. Technical and
          organizational measures include encrypted transport (HTTPS), access
          controls, and server-side handling of sensitive payment data via
          Stripe.
        </p>
        <p>
          No method of transmission over the internet is 100% secure. Report
          suspected issues to{" "}
          <a href={`mailto:${siteConfig.supportEmail}`}>
            {siteConfig.supportEmail}
          </a>
          .
        </p>
      </section>

      <section className="space-y-4">
        <h2>6. Your rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct,
          delete, or restrict processing of your personal data. Contact us to
          submit a request; we will respond within a reasonable timeframe.
        </p>
      </section>

      <section className="space-y-4">
        <h2>7. Cookies</h2>
        <p>
          We use essential cookies for authentication and session management. We
          do not use third-party advertising cookies on the core platform.
        </p>
      </section>

      <section className="space-y-4">
        <h2>8. Changes</h2>
        <p>
          We may update this policy periodically. The “Last updated” date at the
          top reflects the current version. See also our{" "}
          <a href="/legal/terms">Terms of Service</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
