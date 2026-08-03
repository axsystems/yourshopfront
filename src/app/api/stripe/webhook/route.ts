import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { sendEmail } from "@/lib/email"
import { escapeSlackText, notifySlack } from "@/lib/notify"
import { sendOperatorSms } from "@/lib/sms-quo"
import { unprovisionSite } from "@/lib/provisioning/orchestrator"
import {
  COPY_ADDON,
  ONE_TIME,
  PROMO_PERIOD_LABEL,
  PROMO_SETUP,
  STANDARD_MONTHLY,
  STANDARD_SETUP,
} from "@/lib/pricing-constants"
import { stripe } from "@/lib/stripe"
import {
  createSite,
  getCustomerByStripeId,
  getOrCreateCustomer,
  getSiteById,
  getSiteByStripeSessionId,
  supabase,
  updateSiteStatus,
  type Tier,
  type SiteStatus,
} from "@/lib/supabase"

export const runtime = "nodejs"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

/**
 * Stripe webhook receiver.
 *
 * Signature verification: signed with STRIPE_WEBHOOK_SECRET. We pass the
 * raw text body to constructEvent; parsing JSON first would mutate the
 * payload and break the HMAC.
 *
 * Idempotency: Stripe retries webhooks aggressively (especially on slow
 * responses or 5xx). The handler is safe to receive the same
 * checkout.session.completed event multiple times. Guard:
 *   1. getSiteByStripeSessionId(session.id) — if a site row already
 *      exists, return 200 immediately without doing anything else.
 *   2. The unique constraint on sites.stripe_session_id is a
 *      belt-and-suspenders backstop if step 1 races.
 *
 * Event handlers:
 *   - checkout.session.completed → upsert customer, insert site,
 *     send welcome email, ping Slack.
 *   - customer.subscription.deleted → flip site.status to 'cancelled',
 *     send goodbye email.
 *   - All other events: ignored.
 */
export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
  }
  if (!secret) {
    console.error("[webhook] STRIPE_WEBHOOK_SECRET not set")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const payload = await req.text()
  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(payload, sig, secret)
  } catch (err) {
    console.warn("[webhook] signature verification failed", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  console.log(`[webhook] received ${event.type} (${event.id})`)

  try {
    if (event.type === "checkout.session.completed") {
      await handleSessionCompleted(event.data.object)
    } else if (event.type === "customer.subscription.deleted") {
      await handleSubscriptionDeleted(event.data.object)
    } else if (event.type === "charge.refunded") {
      await handleChargeRefunded(event.data.object)
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    // 5xx makes Stripe retry. Log and re-throw via 500.
    console.error("[webhook] handler threw", err)

    // A handler throwing here means Stripe already delivered the event but
    // our side effects (site row, welcome email, provisioning, cancellation
    // cleanup) may not have run. That failure is otherwise invisible —
    // there is no Sentry in this repo, so a Vercel log line is the only
    // trace. Alarm the operator directly. Best-effort, same pattern as the
    // Promise.allSettled side effects above: never let alarm delivery
    // change this response or throw past this catch.
    //
    // Only checkout.session.completed implies money changed hands with no
    // site to show for it — the other two subscribed events (subscription
    // cancellation, refund) don't move money on failure, so their alarm
    // copy must not claim a charge occurred.
    const sessionId = resolveEventSessionId(event)
    const rawErrorMessage = serializeAlarmError(err)
    const severity =
      event.type === "checkout.session.completed"
        ? "customer may be charged with no site"
        : "handler did not complete — event effects may be incomplete"
    // Stripe retries a failing webhook up to ~16 times over 3 days, and this
    // alarm fires on every retry with no dedupe. Deliberate: at this volume
    // a loud, repeated page beats a silent missed charge. Don't "fix" this
    // into silence without adding real dedupe first.
    await Promise.allSettled([
      notifySlack(
        [
          `🚨 *Webhook handler failed — ${severity}*`,
          `Event: \`${event.type}\` (\`${event.id}\`)`,
          // Full session id, not truncated: this alarm's entire purpose is
          // manual recovery, the session id is the primary lookup key, and
          // it isn't PII.
          sessionId ? `Session: \`${sessionId}\`` : `Session: unresolved`,
          `Error: ${escapeSlackText(rawErrorMessage)}`,
        ].join("\n")
      ),
      sendOperatorSms(
        [
          `🚨 WEBHOOK FAILED — Your Shopfront`,
          `${event.type} (${event.id}) — ${severity}`,
          sessionId ? `session ${sessionId}` : "session unresolved",
          rawErrorMessage,
        ].join("\n")
      ),
    ])

    return NextResponse.json({ error: "Handler error" }, { status: 500 })
  }
}

// Best-effort session id extraction for the failure alarm above. Not every
// event type carries one (customer.subscription.deleted and charge.refunded
// don't), so this can legitimately return null.
function resolveEventSessionId(event: Stripe.Event): string | null {
  if (event.type === "checkout.session.completed") {
    return event.data.object.id
  }
  return null
}

// Serializes a caught error into operator-actionable text without leaking
// customer PII. Every helper in src/lib/supabase.ts does a bare
// `if (error) throw error` on Supabase's `{ data, error }` result — this repo
// never calls `.throwOnError()`. Per the installed
// @supabase/postgrest-js (PostgrestBuilder.processResponse), that `error` is
// a plain object literal shaped `{ message, details, hint, code }`
// (JSON.parse'd straight off the PostgREST response body), NOT an Error
// instance, so `err instanceof Error` is false and `String(err)` collapses
// to "[object Object]". `details` is deliberately EXCLUDED below: Postgres
// puts row values there (e.g. "Key (email)=(a@b.com) already exists."),
// which would leak customer PII into Slack/SMS. Real Error instances (e.g.
// a thrown network/fetch error) fall back to `.message`.
//
// MUST ALWAYS return a non-empty string — this feeds straight into
// escapeSlackText(), and an undefined/empty return would throw INSIDE this
// alarm's own catch block, silently killing the one thing that's supposed
// to fire when everything else has already failed. So: no bare
// `JSON.stringify(err)` fallback (returns the literal `undefined` for
// `undefined`/a function/a symbol, and would also re-open the `details`
// leak for an object with no populated message/code/hint but a populated
// details, e.g. a unique-violation with all other fields null) — every
// branch below is allowlisted to a fixed set of safe keys or a literal.
function serializeAlarmError(err: unknown): string {
  if (err instanceof Error) {
    return err.message || "unserializable error (Error with empty message)"
  }
  if (err === null) return "unserializable error (null)"
  if (typeof err === "object") {
    const parts: string[] = []
    if ("message" in err && typeof err.message === "string" && err.message) {
      parts.push(err.message)
    }
    if ("code" in err && typeof err.code === "string" && err.code) {
      parts.push(`code ${err.code}`)
    }
    if ("hint" in err && typeof err.hint === "string" && err.hint) {
      parts.push(`hint: ${err.hint}`)
    }
    if (parts.length > 0) return parts.join(" — ")
    // No message/code/hint to report. Report the shape (key NAMES only,
    // never values) so this can never surface `details` or any other
    // unknown field's content.
    const keys = Object.keys(err)
    return `unserializable error (object, keys: ${keys.length > 0 ? keys.join(", ") : "none"})`
  }
  return `unserializable error (typeof: ${typeof err})`
}

async function handleSessionCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {}

  // Copy-addon upgrade: customer already has a site, they're just buying the add-on.
  if (metadata.upgrade === "copy_addon") {
    await handleCopyAddonUpgrade(session, metadata)
    return
  }

  // Idempotency guard #1: skip if we've already processed this session.
  const existing = await getSiteByStripeSessionId(session.id)
  if (existing) {
    console.log(
      `[webhook] checkout.session.completed already processed: ${session.id} (site ${existing.id})`
    )
    return
  }

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id
  if (!stripeCustomerId) {
    console.error(
      `[webhook] no customer on session ${session.id} — skipping site creation`
    )
    return
  }

  const customerEmail =
    session.customer_details?.email ?? metadata.email ?? null
  const customerName =
    session.customer_details?.name ?? metadata.contact_name ?? null
  const customerPhone =
    session.customer_details?.phone ?? metadata.phone ?? null

  if (!customerEmail || !customerName) {
    // A3: silent failure was the worst possible mode — money collected,
    // no site row, no welcome email, operator only finds out via Stripe
    // Dashboard. Alert immediately before the early return.
    await notifySlack(
      [
        `🚨 *Checkout missing customer data — manual intervention required*`,
        `Session: \`${session.id.slice(-12)}\``,
        `Stripe customer: \`${stripeCustomerId.slice(-12)}\``,
        `Amount: $${((session.amount_total ?? 0) / 100).toFixed(2)}`,
        `Site row NOT created. The customer paid but has no onboarding link.`,
      ].join("\n")
    )
    console.error(
      `[webhook] missing customer email/name on session ${session.id} — skipping`
    )
    return
  }

  const customer = await getOrCreateCustomer({
    stripe_customer_id: stripeCustomerId,
    email: customerEmail,
    name: customerName,
    phone: customerPhone,
  })

  const tier = metadata.tier
  if (tier !== "subscription" && tier !== "onetime") {
    console.error(
      `[webhook] invalid tier in metadata: ${tier} — session ${session.id}`
    )
    return
  }

  const copyAddon = metadata.copy_addon === "true"
  // When copy service is purchased, hold the site in awaiting_copy_draft so
  // the AI drafting flow (Discovery → Haiku → operator review → customer
  // approval) can run before the site is provisioned.
  const initialStatus: SiteStatus = copyAddon ? "awaiting_copy_draft" : "pending_content"

  const site = await createSite({
    id: metadata.site_id || undefined,
    customer_id: customer.id,
    stripe_session_id: session.id,
    tier: tier as Tier,
    demo_slug: metadata.demo_slug || "",
    business_name: metadata.business_name || "",
    industry: metadata.industry || null,
    headline_pref: metadata.headline_pref || null,
    current_website_url: metadata.current_website_url || null,
    hosting_addon: metadata.hosting_addon === "true",
    copy_addon: copyAddon,
    referral_code: metadata.ref || null,
    referral_source: metadata.src || null,
    status: initialStatus,
  })

  // Side effects: best-effort, never throw out of these.
  await Promise.allSettled([
    sendWelcomeEmail({
      to: customer.email,
      name: customer.name,
      tier: site.tier,
      demoSlug: site.demo_slug,
      sessionId: session.id,
      hostingAddon: site.hosting_addon,
      promo: metadata.promo === "launch" ? "launch" : null,
    }),
    notifySlack(
      [
        `*💸 New ${site.tier} sale*`,
        `${site.business_name} · ${site.demo_slug}` +
          (site.industry ? ` · ${site.industry}` : "") +
          (copyAddon ? " · + Copy service" : ""),
        `${customer.email}${customer.phone ? ` · ${customer.phone}` : ""}`,
        `session \`${session.id.slice(-12)}\``,
      ].join("\n")
    ),
    sendOperatorSms(
      [
        `🎉 NEW ${site.tier.toUpperCase()} SALE — Your Shopfront`,
        `${site.business_name} (${site.demo_slug})${copyAddon ? " + Copy" : ""}`,
        customer.email,
      ].join("\n")
    ),
  ])
}

async function handleCopyAddonUpgrade(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  const siteId = metadata.site_id
  if (!siteId) {
    console.error(
      `[webhook] copy_addon upgrade missing site_id — session ${session.id}`
    )
    await notifySlack(
      `🚨 *Copy upgrade — missing site_id* — session \`${session.id.slice(-12)}\``
    )
    return
  }

  const site = await getSiteById(siteId)
  if (!site) {
    console.error(
      `[webhook] copy_addon upgrade: site ${siteId} not found — session ${session.id}`
    )
    await notifySlack(
      `🚨 *Copy upgrade — site not found* \`${siteId.slice(-12)}\` — session \`${session.id.slice(-12)}\``
    )
    return
  }

  // Idempotency: if already flipped, nothing to do.
  if (site.copy_addon) {
    console.log(
      `[webhook] copy_addon upgrade already applied for site ${siteId}`
    )
    return
  }

  const { error } = await supabase()
    .from("sites")
    .update({
      copy_addon: true,
      // Nudge status to awaiting_copy from any pre-build state so the
      // cron can't accidentally provision a site whose copy is still
      // being drafted. ready_to_build is in this list because a customer
      // can complete the worksheet (status flips to ready_to_build) then
      // upgrade to copy service mid-flight.
      ...((["pending_content", "ready_to_build"] as SiteStatus[]).includes(
        site.status
      )
        ? { status: "awaiting_copy_draft" as SiteStatus }
        : {}),
    })
    .eq("id", siteId)

  if (error) {
    console.error(
      `[webhook] copy_addon upgrade DB update failed for site ${siteId}`,
      error
    )
    throw error
  }

  await Promise.allSettled([
    notifySlack(
      `💰 *Copy upgrade purchased* — ${site.business_name} · session \`${session.id.slice(-12)}\``
    ),
    sendOperatorSms(
      `💰 COPY ADDON (${COPY_ADDON}) — Your Shopfront\n${site.business_name}`
    ),
  ])
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  // We set subscription_data.metadata when creating the Checkout session,
  // so subscription.metadata.site_id is the same UUID we put on the
  // matching sites row. If it's missing, fall back to looking up by
  // customer (the most recent site they own).
  const siteId = sub.metadata?.site_id
  if (!siteId) {
    console.warn(
      `[webhook] subscription.deleted with no site_id metadata — sub ${sub.id}`
    )
    return
  }

  // Idempotency guard. Stripe retries on any non-2xx, and nothing below this
  // point is naturally idempotent — a throw after updateSiteStatus (e.g. the
  // Resend or Slack call failing) returns 500, Stripe redelivers, and the
  // customer gets a second goodbye email. Mirrors the guards in
  // handleSessionCompleted and handleChargeRefunded.
  const site = await getSiteById(siteId)
  if (site?.status === "cancelled") {
    console.log(
      `[webhook] subscription.deleted already processed for site ${siteId}`
    )
    return
  }

  await updateSiteStatus(siteId, "cancelled")

  // A1: clean up Cloudflare DNS + Vercel domain attach. Best-effort —
  // log + continue on failure so the goodbye email still sends and the
  // operator gets the Slack ping.
  try {
    if (site) {
      await unprovisionSite(site)
    }
  } catch (err) {
    console.warn(
      `[webhook] unprovision after cancel failed for site ${siteId}`,
      err
    )
  }

  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id
  if (!customerId) return
  const customer = await getCustomerByStripeId(customerId)
  if (!customer) return

  await sendGoodbyeEmail({ to: customer.email, name: customer.name })
  await notifySlack(
    `🚪 *Subscription cancelled* — ${customer.email} · sub \`${sub.id.slice(-12)}\``
  )
}

// A2: charge.refunded → flip site to 'refunded', clean up if live,
// alert operator. Stripe's charge.refunded doesn't carry session_id, so
// we resolve via the Stripe customer ID → our customers table → the
// most recent site row for that customer. Handles both subscription
// refunds and one-time-payment refunds uniformly.
async function handleChargeRefunded(charge: Stripe.Charge) {
  const stripeCustomerId =
    typeof charge.customer === "string" ? charge.customer : charge.customer?.id
  if (!stripeCustomerId) {
    await notifySlack(
      `🚨 charge.refunded with no customer — charge \`${charge.id.slice(-12)}\``
    )
    return
  }

  const customer = await getCustomerByStripeId(stripeCustomerId)
  if (!customer) {
    await notifySlack(
      `🚨 charge.refunded for unknown customer \`${stripeCustomerId.slice(-12)}\` — charge \`${charge.id.slice(-12)}\``
    )
    return
  }

  const { data: sites } = await supabase()
    .from("sites")
    .select("*")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(1)

  const site = sites?.[0]
  if (!site) {
    await notifySlack(
      `🚨 charge.refunded for ${customer.email} but no site row found — charge \`${charge.id.slice(-12)}\``
    )
    return
  }

  // Idempotency: if already refunded, just log + return.
  if (site.status === "refunded") {
    console.log(
      `[webhook] charge.refunded already processed for site ${site.id}`
    )
    return
  }

  const wasLive = site.status === "live"
  await updateSiteStatus(site.id, "refunded")

  if (wasLive) {
    try {
      await unprovisionSite(site)
    } catch (err) {
      console.warn(
        `[webhook] unprovision after refund failed for site ${site.id}`,
        err
      )
    }
  }

  await notifySlack(
    [
      `💸 *Refund processed*`,
      `${site.business_name} · ${customer.email}`,
      `Amount: $${(charge.amount_refunded / 100).toFixed(2)}`,
      wasLive
        ? `Was LIVE — DNS + Vercel cleaned up.`
        : `Prior status: ${site.status}.`,
      `Charge \`${charge.id.slice(-12)}\``,
    ].join("\n")
  )
}

// -----------------------------------------------------------------------------
// Email templates
// -----------------------------------------------------------------------------

interface WelcomeEmailOpts {
  to: string
  name: string
  tier: Tier
  demoSlug: string
  sessionId: string
  hostingAddon: boolean
  // "launch" when this session redeemed the $99 launch promo (checkout
  // route stamps metadata.promo = "launch" only on the subscription tier —
  // see src/app/api/checkout/route.ts). Anything else (including the
  // one-time tier, which has no promo) quotes standard pricing.
  promo: "launch" | null
}

async function sendWelcomeEmail(opts: WelcomeEmailOpts): Promise<void> {
  const onboardingUrl = `${SITE_URL}/onboarding?session_id=${opts.sessionId}`
  const tierLabel =
    opts.tier === "subscription"
      ? opts.promo === "launch"
        ? `Subscription (${PROMO_SETUP} ${PROMO_PERIOD_LABEL})`
        : `Subscription (${STANDARD_SETUP} + ${STANDARD_MONTHLY})`
      : `One-time build (${ONE_TIME})`
  // Show the billing-portal line only for customers with a recurring
  // charge — subscription tier always recurs, and one-time + hosting
  // add-on recurs at $49/mo. Pure one-time has nothing to manage.
  const hasRecurringBilling =
    opts.tier === "subscription" ||
    (opts.tier === "onetime" && opts.hostingAddon)
  const billingLines = hasRecurringBilling
    ? [
        "",
        `Manage your billing any time: ${onboardingUrl}#billing`,
        '(then click "Manage billing" in the page)',
      ]
    : []
  await sendEmail({
    to: opts.to,
    subject: "Welcome to Your Shopfront, let's build your site",
    text: [
      `Hi ${opts.name.split(" ")[0]},`,
      "",
      `Thanks for picking us. You're on the ${tierLabel} plan with the ${opts.demoSlug} style.`,
      "",
      "Next step: head to your onboarding page and send us your content.",
      `It takes about 30 minutes. Once you submit, we have your site live within 24 hours.`,
      "",
      onboardingUrl,
      "",
      "Questions? Just reply to this email. A real person reads every inbound.",
      "",
      "Lost this email? Recover your link any time at yourshopfront.com/access.",
      "",
      "Once your site is live, sign in any time at yourshopfront.com/login to",
      "request changes or check on your account. We just email you a link, so",
      "there's no password to remember.",
      ...billingLines,
      "",
      "Your Shopfront",
    ].join("\n"),
  })
}

async function sendGoodbyeEmail(opts: { to: string; name: string }): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: "Your Shopfront subscription has been cancelled",
    text: [
      `Hi ${opts.name.split(" ")[0]},`,
      "",
      "Your Shopfront subscription has been cancelled. We're sorry to see you go.",
      "",
      "Your site stays live for 30 days as a grace period, which is plenty of time to",
      "migrate or decide to come back. After that, we take it down and your domain reverts.",
      "",
      "If there was anything we could have done better, hit reply. We read every word.",
      "",
      "Your Shopfront",
    ].join("\n"),
  })
}
