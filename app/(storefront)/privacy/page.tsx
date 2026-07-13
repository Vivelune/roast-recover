export default function PrivacyPage() {
    return (
      <div className="max-w-3xl mx-auto px-8 py-16">
        <p className="text-xs uppercase tracking-wide text-ember mb-2">Legal</p>
        <h1 className="font-display font-semibold text-3xl text-char mb-2">
          Privacy Policy
        </h1>
        <p className="text-ash text-sm mb-10">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
  
        <div className="space-y-8 text-ash leading-relaxed text-sm">
  
          <Section title="1. Who We Are">
            <p>
              Roast & Recover LLC operates roastandrecover.com. We are a US
              limited liability company. When we say "we," "us," or "our," we mean
              Roast & Recover LLC. Contact us at{" "}
              <a href="mailto:ritual@roastandrecover.com" className="text-ember">
                ritual@roastandrecover.com
              </a>
              .
            </p>
          </Section>
  
          <Section title="2. What Data We Collect">
            <p>We collect the following categories of data:</p>
            <p className="font-medium text-char">Data you provide directly:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, and password (via Clerk authentication)</li>
              <li>
                Shipping address(es) and billing information
              </li>
              <li>
                Company name (if provided)
              </li>
              <li>
                Messages sent via contact forms or email
              </li>
              <li>
                Reviews and ratings submitted on product pages
              </li>
            </ul>
            <p className="font-medium text-char mt-3">
              Data collected automatically:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Browser type, operating system, IP address (via standard server
                logs)
              </li>
              <li>Pages visited, time spent, referral source</li>
              <li>
                Authentication events (login, logout, session tokens) via Clerk
              </li>
            </ul>
            <p className="font-medium text-char mt-3">
              Data from third-party services:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Payment method information — we do{" "}
                <strong>not</strong> store your credit card number. Payment data
                is handled entirely by Stripe and subject to{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  className="text-ember"
                >
                  Stripe's Privacy Policy
                </a>
                .
              </li>
              <li>Order history and transaction records from Stripe</li>
            </ul>
          </Section>
  
          <Section title="3. How We Use Your Data">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Fulfilling orders</strong> — processing payments,
                communicating order status, coordinating shipping, and providing
                after-sales support
              </li>
              <li>
                <strong>Account management</strong> — authenticating your account,
                storing your order history and equipment registry
              </li>
              <li>
                <strong>Communication</strong> — sending transactional emails
                (order confirmation, shipping updates, balance payment requests)
                via Resend
              </li>
              <li>
                <strong>Service improvement</strong> — analyzing usage patterns to
                improve the Platform
              </li>
              <li>
                <strong>Legal compliance</strong> — retaining records as required
                by applicable law
              </li>
            </ul>
            <p>
              We do not use your data for advertising targeting. We do not sell
              your data to third parties. We do not send marketing emails without
              your explicit opt-in.
            </p>
          </Section>
  
          <Section title="4. How We Store Your Data">
            <p>
              Your account and order data is stored in a PostgreSQL database
              hosted by Neon (neon.tech), with servers located in the United
              States. Neon complies with SOC 2 Type II standards.
            </p>
            <p>
              Authentication data is managed by Clerk (clerk.com), a US-based
              authentication service. Clerk is SOC 2 Type II certified.
            </p>
            <p>
              Product images are stored via Uploadthing, with servers in the
              United States.
            </p>
            <p>
              Transactional emails are sent via Resend (resend.com), a US-based
              email service.
            </p>
          </Section>
  
          <Section title="5. Third-Party Services">
            <p>
              We share data with the following third parties only to the extent
              necessary to operate the Platform:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Stripe</strong> — payment processing. Stripe receives your
                payment card information, billing address, and order amount.
              </li>
              <li>
                <strong>Clerk</strong> — authentication. Clerk stores your email
                and authentication credentials.
              </li>
              <li>
                <strong>Resend</strong> — transactional email delivery. Resend
                receives your email address and the content of transactional emails
                we send to you.
              </li>
              <li>
                <strong>Neon</strong> — database hosting. Neon hosts your stored
                account and order data.
              </li>
              <li>
                <strong>Uploadthing</strong> — file storage. Used for product
                images (not personal data).
              </li>
            </ul>
            <p>
              We do not share your data with any other third parties, including
              our manufacturing partners in China. Order information shared with
              manufacturing partners is limited to product specifications and
              shipping destination — no personal financial data is shared.
            </p>
          </Section>
  
          <Section title="6. Data Retention">
            <p>
              We retain your account data for as long as your account is active.
              Order records are retained for 7 years for accounting and legal
              compliance purposes. If you close your account, we will delete your
              personal profile data within 30 days, while retaining order records
              as required by law.
            </p>
          </Section>
  
          <Section title="7. Your Rights">
            <p>
              Depending on your location, you may have the following rights
              regarding your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Access</strong> — request a copy of the data we hold about
                you
              </li>
              <li>
                <strong>Correction</strong> — request correction of inaccurate
                data
              </li>
              <li>
                <strong>Deletion</strong> — request deletion of your account and
                personal data (subject to legal retention obligations)
              </li>
              <li>
                <strong>Portability</strong> — request your data in a
                machine-readable format
              </li>
              <li>
                <strong>Objection</strong> — object to certain processing of your
                data
              </li>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:ritual@roastandrecover.com" className="text-ember">
                ritual@roastandrecover.com
              </a>
              . We will respond within 30 days.
            </p>
          </Section>
  
          <Section title="8. GDPR (European Users)">
            <p>
              If you are located in the European Economic Area (EEA) or United
              Kingdom, you have additional rights under the General Data Protection
              Regulation (GDPR). Our legal basis for processing your data is:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Contract performance</strong> — processing necessary to
                fulfill your order
              </li>
              <li>
                <strong>Legal obligation</strong> — processing required by law
                (e.g., tax records)
              </li>
              <li>
                <strong>Legitimate interests</strong> — fraud prevention, security,
                service improvement
              </li>
            </ul>
            <p>
              If you have a GDPR complaint, you have the right to lodge a
              complaint with your local data protection authority.
            </p>
          </Section>
  
          <Section title="9. Cookies">
            <p>
              We use only essential cookies necessary to operate the Platform
              (authentication session tokens). We do not use advertising,
              analytics, or tracking cookies. No consent banner is required for
              essential cookies under applicable law.
            </p>
          </Section>
  
          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify
              registered users of material changes by email. Continued use of the
              Platform after changes constitutes acceptance of the updated policy.
            </p>
          </Section>
  
        </div>
      </div>
    );
  }
  
  function Section({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <section>
        <h2 className="font-display font-semibold text-lg text-char mb-3 pb-2 border-b border-border">
          {title}
        </h2>
        <div className="space-y-3">{children}</div>
      </section>
    );
  }