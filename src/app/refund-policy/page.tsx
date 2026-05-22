import type { Metadata } from "next"

import { LegalPage } from "@/components/apex/legal-page"
import { SITE_URL } from "@/lib/seo"

const URL = `${SITE_URL}/refund-policy`

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "30-day money-back guarantee on Your Shopfront. The exact terms.",
  alternates: { canonical: URL },
}

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" lastUpdated="2026-05-04" draft>
      <p>
        We offer a 30-day money-back guarantee on the setup portion of your purchase. The exact terms below.
      </p>

      <h2>Subscription tier</h2>
      <p>
        The $499 setup fee is fully refundable for 30 days from the date you submitted your content worksheet — no questions asked. If you decide Your Shopfront isn&apos;t for you within that window, email{" "}
        <a href="mailto:hello@yourshopfront.com">hello@yourshopfront.com</a> and we&apos;ll process the refund within 5 business days.
      </p>
      <p>
        Monthly fees ($199/mo) are non-refundable, but you can cancel any time from your customer portal — you&apos;ll only ever pay for the months you actually use. Cancellation is immediate; your site stays online for 30 days as a grace period after cancellation.
      </p>

      <h2>One-time build</h2>
      <p>
        The $2,997 one-time payment is fully refundable for 30 days from launch — provided the site has not yet been moved off our staging URL onto your own domain. Once the site is live on your own infrastructure, the source-code transfer is final and the payment is non-refundable.
      </p>
      <p>
        The optional $29/month hosting addon follows the subscription rules above: cancel any time, only pay for the months you use, 30-day grace period after cancellation.
      </p>

      <h2>How to request a refund</h2>
      <p>
        Email <a href="mailto:hello@yourshopfront.com">hello@yourshopfront.com</a> with the subject line &ldquo;Refund request&rdquo; and the email address you used at checkout. We process all refund requests within 5 business days. Refunds are returned to the original payment method via Stripe.
      </p>

      <h2>Edge cases</h2>
      <p>
        If you have a billing question that doesn&apos;t fit cleanly into the categories above — duplicate charges, accidental purchases, fraud claims — email us. A real person reads every refund email; we&apos;d rather sort it out directly than hide behind a policy.
      </p>
    </LegalPage>
  )
}
