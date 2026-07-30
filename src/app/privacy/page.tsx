import type { Metadata } from "next"

import { LegalPage } from "@/components/apex/legal-page"
import { SITE_URL } from "@/lib/seo"

const URL = `${SITE_URL}/privacy`

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Your Shopfront collects, uses, and protects your information.",
  alternates: { canonical: URL },
}

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="2026-07-30">
      <p>
        Your Shopfront (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) provides website design and hosting services for small businesses. This policy describes what personal information we collect, how we use it, and the choices you have. It applies to yourshopfront.com and any sites we host on your behalf.
      </p>

      <h2>What we collect</h2>
      <p>
        When you contact us or buy through our checkout, we collect the information you provide directly: your name, business name, email address, phone number, industry, and any content you send us to populate your site (logo, photos, copy). We collect billing information through Stripe — we never see or store your card number.
      </p>
      <p>
        We collect basic usage data automatically: the pages you visit on yourshopfront.com, the device and browser you use, and approximate location derived from your IP address. We use this data to understand how the site performs and to improve it.
      </p>

      <h2>How we use it</h2>
      <p>
        We use your information to deliver the service you bought: to build and host your site, to send you transactional email about your account, and to respond to your questions. We do not sell your personal information to anyone, and we do not use it for advertising on third-party platforms.
      </p>

      <h2>Who we share it with</h2>
      <p>
        We share your information with a small set of service providers we use to operate Your Shopfront: Stripe (payment processing), Supabase (database hosting), Resend (transactional email), Vercel (web hosting), and Cloudflare (DNS and CDN). Each of these vendors processes data on our behalf under their own privacy commitments.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request a copy of the personal information we hold about you, ask us to correct inaccurate information, or ask us to delete your account. Email{" "}
        <a href="mailto:hello@yourshopfront.com">hello@yourshopfront.com</a> with your request and we&apos;ll respond within 30 days.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        Your Shopfront uses a single first-party session cookie to maintain your authenticated state during checkout and onboarding.
      </p>
      <p>
        We use Google Analytics to understand how people use yourshopfront.com. Google Analytics sets first-party cookies in your browser (including one named _ga) and assigns your browser a persistent ID so it can recognize repeat visits. We also use Vercel Analytics, which does not use cookies. The same Google tag also supports Google Ads conversion tracking; we have not turned that feature on, but if we do in the future it will run through this same tag and will be covered by this policy.
      </p>
      <p>
        We use session-recording software to see how visitors move through and interact with our pages — clicks, scrolls, and taps — so we can find and fix problems with the site. It never sees anything you type into a checkout form, because payment details are entered directly on Stripe&apos;s own page, not on ours.
      </p>

      <h2>Children</h2>
      <p>
        Your Shopfront is intended for businesses, not individuals under 18. We do not knowingly collect information from children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &ldquo;last updated&rdquo; date at the top of this page reflects the most recent change. Material changes will be communicated via email to active customers.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy or our data practices: <a href="mailto:hello@yourshopfront.com">hello@yourshopfront.com</a>.
      </p>
    </LegalPage>
  )
}
