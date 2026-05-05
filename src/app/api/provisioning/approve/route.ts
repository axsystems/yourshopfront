import "server-only"

import { NextResponse } from "next/server"
import { z } from "zod"

import { sendEmail } from "@/lib/email"
import { notifySlack } from "@/lib/notify"
import {
  getCustomerByStripeId,
  getSiteById,
  supabase,
  transitionStatus,
  updateProvisioningState,
} from "@/lib/supabase"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BodySchema = z.object({
  site_id: z.string().uuid(),
})

/**
 * Admin-only endpoint to flip a site from 'awaiting_approval' to 'live'
 * after the build is finished and the customer has signed off.
 *
 * Auth: bearer token equal to ADMIN_PASSWORD env var. Rotate ADMIN_PASSWORD
 * before launch. Once we have a real admin UI with sessions, replace
 * this with proper auth — bearer-via-env is a launch shortcut, not a
 * long-term pattern.
 */
export async function POST(req: Request): Promise<Response> {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { error: "Admin endpoint not configured" },
      { status: 500 }
    )
  }
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request shape" }, { status: 400 })
  }

  const site = await getSiteById(parsed.data.site_id)
  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 })
  }
  if (site.status !== "awaiting_approval") {
    return NextResponse.json(
      {
        error: `Site is in status '${site.status}', not 'awaiting_approval'`,
      },
      { status: 409 }
    )
  }

  const flipped = await transitionStatus(site.id, "awaiting_approval", "live")
  if (!flipped) {
    return NextResponse.json(
      { error: "Status changed during request — try again" },
      { status: 409 }
    )
  }

  await updateProvisioningState(site.id, {
    ...site.provisioning_state,
    live_at: new Date().toISOString(),
  })

  // Best-effort side effects.
  await Promise.allSettled([
    notifySlack(
      [
        `🚀 *Site live!*`,
        `${site.business_name} · ${site.live_url ?? "(no URL?)"}`,
      ].join("\n")
    ),
    sendCustomerLiveEmail(site.id),
  ])

  return NextResponse.json({ ok: true })
}

async function sendCustomerLiveEmail(siteId: string): Promise<void> {
  const site = await getSiteById(siteId)
  if (!site) return
  const { data: customer } = await supabase()
    .from("customers")
    .select("*")
    .eq("id", site.customer_id)
    .maybeSingle()
  if (!customer) return
  // Avoid TS narrowing complaints — getCustomerByStripeId already exposes
  // the typed customer interface; we only need email/name here.
  const _typed = await getCustomerByStripeId(customer.stripe_customer_id)
  if (!_typed) return

  await sendEmail({
    to: _typed.email,
    subject: `Your ${site.business_name} site is live`,
    text: [
      `Hi ${_typed.name.split(" ")[0]},`,
      "",
      `Your site is live at ${site.live_url}.`,
      "",
      "If anything looks off, hit reply — we'll fix it the same day.",
      "",
      "— Apex Sites",
    ].join("\n"),
  })
}
