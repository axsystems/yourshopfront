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
    <LegalPage title="Refund Policy" lastUpdated="2026-05-21">
      <p>
        Your Shopfront is backed by a 30-day money-back guarantee, with one
        common-sense exception: once we&apos;ve started building your site or
        you&apos;ve taken possession of your source code, that work can&apos;t
        be undone. The exact terms below.
      </p>

      <h2>Subscription tier</h2>
      <p>
        <strong>Setup fee ($299, or $99 during our launch promo).</strong>{" "}
        Fully refundable <em>before</em> you submit your content worksheet.
        Once you submit the worksheet, our team starts building, and the
        setup fee covers that work — at that point it becomes
        non-refundable.
      </p>
      <p>
        <strong>Monthly subscription ($149/mo, or $99/mo for your first 3 months during the launch promo).</strong>{" "}
        Your first month is fully refundable within 30 days of the first
        charge. After your first month, monthly payments are non-refundable,
        but you can cancel any time from your customer portal — you&apos;ll
        only ever pay for the months you actually use. Cancellation is
        immediate; your site stays online for 30 days as a grace period.
      </p>

      <h2>One-time build</h2>
      <p>
        The $997 one-time payment is fully refundable for 30 days from
        launch, with one critical cutoff:{" "}
        <strong>
          once you&apos;ve received the source code or pointed your own
          domain at the site, the payment is final.
        </strong>{" "}
        Source-code transfer is irreversible — once you have it, we can&apos;t
        undo the delivery.
      </p>
      <p>
        The optional $49/month managed hosting + edits addon follows the
        subscription rules above: first month refundable within 30 days,
        then non-refundable but cancellable any time with a 30-day grace
        period.
      </p>

      <h2>How to request a refund</h2>
      <p>
        Email <a href="mailto:hello@yourshopfront.com">hello@yourshopfront.com</a>{" "}
        with the subject line &ldquo;Refund request&rdquo; and the email
        address you used at checkout. We process all refund requests within
        5 business days. Refunds are returned to the original payment
        method via Stripe.
      </p>

      <h2>Edge cases</h2>
      <p>
        If you have a billing question that doesn&apos;t fit cleanly into
        the categories above — duplicate charges, accidental purchases,
        fraud claims, abnormally delayed delivery on our end — email us. A
        real person reads every refund email; we&apos;d rather sort it out
        directly than hide behind a policy.
      </p>
    </LegalPage>
  )
}
