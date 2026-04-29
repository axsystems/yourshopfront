import { NextResponse } from "next/server"
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

  // TODO (Phase 4): wire to Resend.
  // For now, log to server output. Real email delivery happens once
  // RESEND_API_KEY is configured + Phase 4 ships the email integration.
  console.log("[contact] inbound message", {
    name: data.name,
    email: data.email,
    business: data.business,
    industry: data.industry || null,
    ref: data.ref || null,
    piece: data.piece || null,
    messageChars: data.message.length,
  })

  return NextResponse.json({ ok: true })
}
