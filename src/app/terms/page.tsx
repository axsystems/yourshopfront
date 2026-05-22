import type { Metadata } from "next"

import { LegalPage } from "@/components/apex/legal-page"
import { SITE_URL } from "@/lib/seo"

const URL = `${SITE_URL}/terms`

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The agreement between you and Your Shopfront for using our service.",
  alternates: { canonical: URL },
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="2026-05-04" draft>
      <p>
        These terms govern your use of Your Shopfront (yourshopfront.com) and any websites we build, host, or maintain on your behalf. By buying our service or using the site, you agree to these terms.
      </p>

      <h2>The service</h2>
      <p>
        Your Shopfront builds and hosts production-grade websites for small businesses of every kind. We offer two tiers:
      </p>
      <ul>
        <li><strong>Subscription:</strong> $299 setup fee plus $149/month. Includes hosting, unlimited content edits, SSL, backups, security patches, and Google Business Profile management. Cancel any time.</li>
        <li><strong>One-time build:</strong> $997 paid once. Includes the full source code on launch. Optional $49/month managed hosting addon (includes unlimited small edits + monthly SEO check).</li>
      </ul>

      <h2>Delivery and acceptance</h2>
      <p>
        We commit to launching your site within 24 hours of receiving your completed content worksheet. If we miss that window, the first month of subscription is free, or we&apos;ll discount the one-time build by $250 — your choice.
      </p>
      <p>
        You review the site on a private staging URL before launch. You can request unlimited revisions during the first 30 days at no additional cost. After launch, ongoing edits are included with the subscription tier; one-time customers receive 30 days of free edits and can purchase additional edit blocks afterwards.
      </p>

      <h2>Refunds</h2>
      <p>
        See the <a href="/refund-policy">refund policy</a> for the full terms. Summary: 30-day money-back on the setup fee or one-time build payment, no questions asked. Monthly subscription fees are non-refundable but you can cancel any time and only pay for the months you use.
      </p>

      <h2>Your content</h2>
      <p>
        You retain ownership of all content you provide — text, images, logos, customer data. You grant us a license to use, display, and modify that content solely for the purpose of building and operating your site. We do not use your content for any other purpose.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You agree not to use Your Shopfront to host content that is illegal, infringes someone else&apos;s rights, contains malware, or violates Stripe&apos;s acceptable-use policy. We reserve the right to suspend any site we determine in good faith violates these rules.
      </p>

      <h2>Liability</h2>
      <p>
        Your Shopfront is provided &ldquo;as is.&rdquo; We make best efforts to keep your site online and secure, but we don&apos;t guarantee uninterrupted service. Our liability is capped at the amount you paid us in the most recent twelve months.
      </p>

      <h2>Termination</h2>
      <p>
        Subscription customers can cancel at any time from their customer portal or by emailing us. After cancellation, your site stays online for 30 days as a grace period. One-time customers own the source code and can self-host indefinitely.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of [TBD — typically the founder&apos;s state of incorporation]. Disputes are resolved in the courts located there.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms occasionally. Material changes will be communicated via email to active customers at least 30 days before they take effect.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: <a href="mailto:hello@yourshopfront.com">hello@yourshopfront.com</a>.
      </p>
    </LegalPage>
  )
}
