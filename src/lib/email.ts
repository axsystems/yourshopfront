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
