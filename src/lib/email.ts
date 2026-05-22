import "server-only"
import { Resend } from "resend"

export interface SendEmailOpts {
  to: string
  subject: string
  text: string
  replyTo?: string
  /** Override default from. Defaults to RESEND_FROM_EMAIL or onboarding@resend.dev. */
  from?: string
}

// Production should set RESEND_FROM_EMAIL to "Your Shopfront <hello@yourshopfront.com>"
// once DNS records are verified in Resend. Until then, we fall back to the
// shared resend.dev sender — works without domain verification but routes
// through Resend's subdomain.
const DEFAULT_FROM = "Your Shopfront <onboarding@resend.dev>"

/**
 * Best-effort transactional email send. Never throws — logs warnings if
 * RESEND_API_KEY is missing or the call fails. Callers should not depend
 * on delivery; treat email as a side-effect.
 */
export async function sendEmail(opts: SendEmailOpts): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(`[email] skipped — RESEND_API_KEY not set: ${opts.subject}`)
    return
  }
  try {
    const from = opts.from ?? process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from,
      to: [opts.to],
      replyTo: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
    })
    if (error) {
      console.warn("[email] resend error:", error)
    }
  } catch (err) {
    console.warn("[email] resend threw:", err)
  }
}

interface CopyReadyForReviewEmailOpts {
  to: string
  firstName: string
  onboardingUrl: string
}

/**
 * Sent to the customer after the operator has reviewed + approved the AI
 * draft. Plain text, same voice as sendAccessLinkEmail. Caller is responsible
 * for verifying the email belongs to the right customer.
 */
export async function sendCopyReadyForReviewEmail(
  opts: CopyReadyForReviewEmailOpts
): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: "Your draft is ready for review",
    text: [
      `Hi ${opts.firstName},`,
      "",
      "Your AI-drafted site copy has been reviewed by our team and is ready for your approval.",
      "",
      `Review it here: ${opts.onboardingUrl}`,
      "",
      "If everything looks good, click \"Build my site\" and we'll have your site live in 24-48 hours. If you'd like changes, just let us know — we read every reply.",
      "",
      "— Your Shopfront",
    ].join("\n"),
  })
}

interface CopyChangeRequestEmailOpts {
  /** Operator inbox — defaults to hello@yourshopfront.com if omitted. */
  to?: string
  siteId: string
  businessName: string
  feedback: string
}

/**
 * Sent to the operator inbox when a customer requests changes to the
 * AI-drafted copy. Best-effort like every other sendEmail caller —
 * fire-and-forget, never blocks the action's response.
 */
export async function sendCopyChangeRequestEmail(
  opts: CopyChangeRequestEmailOpts
): Promise<void> {
  const to = opts.to ?? "hello@yourshopfront.com"
  await sendEmail({
    to,
    subject: `Copy change request — ${opts.businessName}`,
    text: [
      `Site: ${opts.siteId}`,
      `Business: ${opts.businessName}`,
      "",
      "Customer feedback:",
      opts.feedback,
    ].join("\n"),
  })
}

interface AccessLinkEmailOpts {
  to: string
  firstName: string
  onboardingUrl: string
}

/**
 * Self-serve recovery email — fires from /api/access when a customer
 * requests a fresh onboarding link. Plain text, no marketing tone, mirrors
 * the welcome-email voice. Caller is responsible for verifying the email
 * belongs to a real customer; this helper just composes + sends.
 */
export async function sendAccessLinkEmail(
  opts: AccessLinkEmailOpts
): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: "Your Shopfront access link",
    text: [
      `Hi ${opts.firstName},`,
      "",
      "You asked us to send you a fresh access link to your Your Shopfront account. Here it is:",
      "",
      opts.onboardingUrl,
      "",
      "Bookmark that page so you don't lose it again. If you didn't request this email, ignore it — your account is unaffected.",
      "",
      "Questions? Just reply to this email.",
      "",
      "— Your Shopfront",
    ].join("\n"),
  })
}
