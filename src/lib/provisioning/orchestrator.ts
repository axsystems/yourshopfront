import "server-only"

import { notifySlack } from "@/lib/notify"
import {
  markFailed,
  setLiveUrl,
  setProvisionSlug,
  transitionStatus,
  updateProvisioningState,
  type ProvisioningState,
  type Site,
} from "@/lib/supabase"

import {
  createSubdomainCname,
  deleteSubdomainCname,
} from "./cloudflare"
import { findAvailableProvisionSlug } from "./slug"
import {
  addDomainToProject,
  removeDomainFromProject,
} from "./vercel"

/**
 * Walks a single site through the provisioning state machine. Designed
 * to be called from a cron tick — safe to invoke repeatedly on the same
 * site (every step is idempotent).
 *
 * State machine:
 *
 *   ready_to_build
 *     │
 *     ├─ reserve provision_slug (if missing)
 *     │
 *     ├─ flip status → 'provisioning' (atomic guard via transitionStatus)
 *     │
 *     ├─ create CNAME via Cloudflare (skip if state.dns.complete)
 *     │
 *     ├─ attach domain to Vercel project (skip if state.vercel.complete)
 *     │
 *     ├─ set live_url
 *     │
 *     └─ flip status → 'awaiting_approval', Slack ping
 *
 * Failures at any step → status='failed', failure_reason=<message>,
 * Slack alert. Subsequent ticks won't retry failed sites — ops must
 * intervene (clear failure_reason and flip status back to ready_to_build).
 */
export async function provisionSite(site: Site): Promise<void> {
  // Guard 1: only progress sites in ready_to_build or provisioning. Any
  // other state is either done or needs manual attention.
  if (site.status !== "ready_to_build" && site.status !== "provisioning") {
    return
  }

  try {
    // Step 1: ensure we have a provision_slug. Reserved on first run.
    let provisionSlug = site.provision_slug
    if (!provisionSlug) {
      provisionSlug = await findAvailableProvisionSlug(site.business_name)
      await setProvisionSlug(site.id, provisionSlug)
    }

    // Step 2: claim ownership by flipping status to 'provisioning'. The
    // transitionStatus guard prevents two cron invocations from racing
    // each other on the same site.
    if (site.status === "ready_to_build") {
      const claimed = await transitionStatus(
        site.id,
        "ready_to_build",
        "provisioning"
      )
      if (!claimed) {
        // Another tick beat us to it. Bail — they'll finish the work.
        return
      }
    }

    // Step 3: provision DNS (idempotent — Cloudflare client returns the
    // existing record if one already points at Vercel).
    let state: ProvisioningState = site.provisioning_state ?? {}
    if (!state.dns?.complete) {
      const { id: recordId, hostname } = await createSubdomainCname(provisionSlug)
      state = {
        ...state,
        dns: {
          complete: true,
          completed_at: new Date().toISOString(),
          record_id: recordId,
        },
      }
      await updateProvisioningState(site.id, state)
      // hostname is unused here but logging it helps debugging.
      console.log(`[provision ${site.id}] DNS ready: ${hostname}`)
    }

    // Step 4: attach domain to Vercel project (idempotent — 409 from
    // Vercel = already attached = success).
    const apex = process.env.APEX_DOMAIN ?? "yourshopfront.com"
    const fullHostname = `${provisionSlug}.${apex}`
    if (!state.vercel?.complete) {
      await addDomainToProject(fullHostname)
      state = {
        ...state,
        vercel: {
          complete: true,
          completed_at: new Date().toISOString(),
          domain: fullHostname,
        },
      }
      await updateProvisioningState(site.id, state)
    }

    // Step 5: set live_url. Until the customer approves, this is the
    // staging URL — it becomes the live URL when status flips to 'live'.
    const stagingUrl = `https://${fullHostname}`
    await setLiveUrl(site.id, stagingUrl)

    // Step 6: flip to awaiting_approval and ping ops.
    state = {
      ...state,
      approval_pending_at: new Date().toISOString(),
    }
    await updateProvisioningState(site.id, state)
    await transitionStatus(site.id, "provisioning", "awaiting_approval")

    await notifySlack(
      [
        `🛠 *Site provisioned — awaiting approval*`,
        `${site.business_name} · demo \`${site.demo_slug}\``,
        `Staging: ${stagingUrl}`,
        `Site id \`${site.id}\``,
      ].join("\n")
    )

    console.log(`[provision ${site.id}] ✅ awaiting_approval at ${stagingUrl}`)
  } catch (err) {
    const reason =
      err instanceof Error ? err.message : "Unknown provisioning error"
    console.error(`[provision ${site.id}] ❌ ${reason}`, err)
    await markFailed(site.id, reason)
    await notifySlack(
      [
        `🚨 *Provisioning failed*`,
        `${site.business_name} · site \`${site.id}\``,
        `Reason: ${reason}`,
      ].join("\n")
    )
  }
}

/**
 * Tears down DNS + Vercel domain on cancellation. Best-effort — logs
 * errors but doesn't throw, since the cancellation path shouldn't be
 * blocked by an external API hiccup.
 */
export async function unprovisionSite(site: Site): Promise<void> {
  const recordId = site.provisioning_state?.dns?.record_id
  const domain = site.provisioning_state?.vercel?.domain

  if (recordId) {
    try {
      await deleteSubdomainCname(recordId)
    } catch (err) {
      console.warn(`[unprovision ${site.id}] DNS delete failed`, err)
    }
  }
  if (domain) {
    try {
      await removeDomainFromProject(domain)
    } catch (err) {
      console.warn(`[unprovision ${site.id}] Vercel detach failed`, err)
    }
  }
}
