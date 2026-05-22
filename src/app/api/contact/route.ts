import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit } from "@/lib/chat/rate-limit"
import { sendEmail } from "@/lib/email"
import { getClientIp } from "@/lib/get-client-ip"
import { notifySlack } from "@/lib/notify"

const ContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Valid email required").max(200),
  business: z.string().min(1, "Business name is required").max(200),
  industry: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
  ref: z.string().max(60).optional().or(z.literal("")),
  piece: z.string().max(80).optional().or(z.literal("")),
})

type ContactData = z.infer<typeof ContactSchema>

export async function POST(req: Request) {
  // B2: tight rate limit — contact form fans out to Resend + Slack on
  // every successful submission, both of which are spend/cap-bound.
  // 3/min/IP keeps a determined attacker from burning the Resend monthly
  // cap or blowing up the Slack channel. Namespaced key so contact and
  // chat have separate buckets.
  const ip = getClientIp(req)
  const limit = checkRateLimit(`contact:${ip}`, 3)
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Too many requests. Try again in a moment.",
        retryAfterSeconds: limit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "retry-after": String(limit.retryAfterSeconds) },
      }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = ContactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    )
  }

  const data = parsed.data

  // Always log so dev visibility doesn't depend on third-party config.
  console.log("[contact] inbound message", {
    name: data.name,
    email: data.email,
    business: data.business,
    industry: data.industry || null,
    ref: data.ref || null,
    piece: data.piece || null,
    messageChars: data.message.length,
  })

  // Fan out side effects in parallel. Both helpers are best-effort and
  // never throw — a missing env var or third-party failure logs a warning
  // and the form still returns {ok:true}.
  await Promise.allSettled([
    sendContactEmail(data),
    notifyContactSlack(data),
  ])

  return NextResponse.json({ ok: true })
}

async function sendContactEmail(data: ContactData): Promise<void> {
  const inbox = process.env.CONTACT_INBOX_EMAIL
  if (!inbox) {
    console.warn("[contact] email skipped — CONTACT_INBOX_EMAIL not set")
    return
  }
  await sendEmail({
    to: inbox,
    replyTo: data.email,
    subject: `Contact: ${data.name} — ${data.ref || "general"}`,
    text: [
      `Name:     ${data.name}`,
      `Email:    ${data.email}`,
      `Business: ${data.business}`,
      `Industry: ${data.industry || "(not given)"}`,
      `Ref:      ${data.ref || "(none)"}`,
      `Piece:    ${data.piece || "(none)"}`,
      "",
      "Message:",
      data.message,
    ].join("\n"),
  })
}

async function notifyContactSlack(data: ContactData): Promise<void> {
  const headline =
    data.piece && data.ref
      ? `New contact (${data.ref}/${data.piece})`
      : data.ref
        ? `New contact (${data.ref})`
        : "New contact"
  const text = [
    `*${headline}*`,
    `${data.name} <${data.email}> · ${data.business}` +
      (data.industry ? ` · ${data.industry}` : ""),
    "```",
    data.message.length > 600 ? data.message.slice(0, 600) + "…" : data.message,
    "```",
  ].join("\n")
  await notifySlack(text)
}
