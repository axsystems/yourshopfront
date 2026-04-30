import { NextResponse } from "next/server"
import { Resend } from "resend"
import { z } from "zod"

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

const DEFAULT_FROM = "Apex Sites <onboarding@resend.dev>"

export async function POST(req: Request) {
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

  // Fan out side effects in parallel. Each one is best-effort: a missing
  // env var or a third-party failure gets logged as a warning and the
  // form still returns {ok:true} so the user never sees an error.
  await Promise.allSettled([sendEmail(data), notifySlack(data)])

  return NextResponse.json({ ok: true })
}

async function sendEmail(data: ContactData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const inbox = process.env.CONTACT_INBOX_EMAIL
  if (!apiKey || !inbox) {
    console.warn(
      `[contact] email skipped — ${!apiKey ? "RESEND_API_KEY" : "CONTACT_INBOX_EMAIL"} not set`
    )
    return
  }
  try {
    const from = process.env.RESEND_FROM_EMAIL ?? DEFAULT_FROM
    const resend = new Resend(apiKey)
    const subject = `Contact: ${data.name} — ${data.ref || "general"}`
    const text = [
      `Name:     ${data.name}`,
      `Email:    ${data.email}`,
      `Business: ${data.business}`,
      `Industry: ${data.industry || "(not given)"}`,
      `Ref:      ${data.ref || "(none)"}`,
      `Piece:    ${data.piece || "(none)"}`,
      "",
      "Message:",
      data.message,
    ].join("\n")
    const { error } = await resend.emails.send({
      from,
      to: [inbox],
      replyTo: data.email,
      subject,
      text,
    })
    if (error) {
      console.warn("[contact] resend error", error)
    }
  } catch (err) {
    console.warn("[contact] resend threw", err)
  }
}

async function notifySlack(data: ContactData): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  try {
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
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) {
      console.warn("[contact] slack non-2xx", res.status, await res.text().catch(() => ""))
    }
  } catch (err) {
    console.warn("[contact] slack threw", err)
  }
}
