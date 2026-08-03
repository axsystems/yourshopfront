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
      "If everything looks good, click \"Build my site\" and we'll have your site live in 24-48 hours. If you'd like changes, just let us know. We read every reply.",
      "",
      "Your Shopfront",
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
    subject: `Copy change request for ${opts.businessName}`,
    text: [
      `Site: ${opts.siteId}`,
      `Business: ${opts.businessName}`,
      "",
      "Customer feedback:",
      opts.feedback,
    ].join("\n"),
  })
}

export interface LeadNotificationEmailOpts {
  /**
   * The business owner's inbox — resolve with getLeadNotificationRecipient()
   * in ./leads. Null/empty is expected and handled: some sites publish no
   * email address, and a lead is still a success without the notification.
   */
  to: string | null | undefined
  businessName: string
  leadName: string
  leadEmail?: string | null
  leadPhone?: string | null
  message?: string | null
  /** Pathname or named form the lead came from. */
  sourcePage?: string | null
  /** Raw calculator answers, rendered as one line per key when non-empty. */
  calculatorInput?: Record<string, unknown> | null
  /** Computed quote in dollars. */
  calculatorEstimate?: number | null
}

/**
 * Tells the business owner they got a lead on their site. Best-effort like
 * every other sender here — never throws, so the visitor's submission is
 * never blocked by a mail failure.
 *
 * replyTo is the visitor's address so the owner can answer by hitting reply.
 * From stays the Your Shopfront sender: the visitor's domain isn't verified
 * in Resend, so sending as them would fail DMARC.
 */
export async function sendLeadNotificationEmail(
  opts: LeadNotificationEmailOpts
): Promise<void> {
  const to = opts.to?.trim()
  if (!to) {
    console.warn(
      `[email] lead notification skipped — no recipient for ${opts.businessName}`
    )
    return
  }
  const lines = [
    `You have a new lead from your website.`,
    "",
    `Name:  ${opts.leadName}`,
    `Email: ${opts.leadEmail || "(not given)"}`,
    `Phone: ${opts.leadPhone || "(not given)"}`,
    `From:  ${opts.sourcePage || "(not given)"}`,
  ]
  if (typeof opts.calculatorEstimate === "number") {
    lines.push(`Estimate: $${opts.calculatorEstimate.toFixed(2)}`)
  }
  const calc = Object.entries(opts.calculatorInput ?? {})
  if (calc.length > 0) {
    lines.push("", "Quote details:")
    for (const [key, value] of calc) {
      lines.push(`  ${key}: ${formatCalculatorValue(value)}`)
    }
  }
  if (opts.message?.trim()) {
    lines.push("", "Message:", opts.message.trim())
  }
  lines.push("", "Reply to this email to reach them directly.", "", "Your Shopfront")

  await sendEmail({
    to,
    replyTo: opts.leadEmail?.trim() || undefined,
    subject: `New lead for ${opts.businessName}: ${opts.leadName}`,
    text: lines.join("\n"),
  })
}

/** JSONB values are arbitrary; keep objects/arrays readable in plain text. */
function formatCalculatorValue(value: unknown): string {
  if (value === null || value === undefined) return "(none)"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
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
      "Bookmark that page so you don't lose it again. If you didn't request this email, ignore it. Your account is unaffected.",
      "",
      "Questions? Just reply to this email.",
      "",
      "Your Shopfront",
    ].join("\n"),
  })
}
