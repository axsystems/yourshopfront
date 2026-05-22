import "server-only"

/**
 * Minimal Cloudflare DNS REST API client for Phase 5 provisioning. Single
 * surface — managing CNAME records on the yourshopfront.com zone — so we
 * don't pull in `cloudflare`.
 *
 * Reference: https://developers.cloudflare.com/api/operations/dns-records-for-a-zone-create-dns-record
 */

const CLOUDFLARE_API = "https://api.cloudflare.com/client/v4"

/**
 * The Vercel "anycast" CNAME target for custom domains attached to a
 * Vercel project. This is the canonical value Vercel publishes; if it
 * ever changes, we'd update here only.
 *
 * https://vercel.com/docs/projects/domains/working-with-domains#cname
 */
const VERCEL_CNAME_TARGET = "cname.vercel-dns.com"

interface CloudflareEnv {
  token: string
  zoneId: string
}

function loadEnv(): CloudflareEnv {
  const token = process.env.CLOUDFLARE_API_TOKEN
  const zoneId = process.env.CLOUDFLARE_ZONE_ID
  if (!token || !zoneId) {
    throw new Error(
      "cloudflare(): CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID must both be set"
    )
  }
  return { token, zoneId }
}

interface CfResponse<T> {
  success: boolean
  errors: Array<{ code: number; message: string }>
  result: T
}

async function cfFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { token, zoneId } = loadEnv()
  const res = await fetch(`${CLOUDFLARE_API}/zones/${zoneId}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  const json = (await res.json()) as CfResponse<T>
  if (!res.ok || !json.success) {
    const msg = json.errors?.map((e) => `${e.code}:${e.message}`).join(", ")
    throw new Error(
      `Cloudflare ${init?.method ?? "GET"} ${path} failed: ${res.status} ${msg}`
    )
  }
  return json.result
}

/**
 * Looks up a DNS record by its full name (e.g. "northridge-plumbing.yourshopfront.com").
 * Returns null when no matching record exists. Used for idempotency in
 * createSubdomainCname.
 */
export async function findCnameByName(
  fullHostname: string
): Promise<{ id: string; content: string } | null> {
  const records = await cfFetch<Array<{ id: string; type: string; content: string }>>(
    `/dns_records?type=CNAME&name=${encodeURIComponent(fullHostname)}`
  )
  const found = records.find((r) => r.type === "CNAME")
  return found ? { id: found.id, content: found.content } : null
}

/**
 * Idempotently creates `<subdomain>.yourshopfront.com → cname.vercel-dns.com`.
 * If a CNAME with the same name already exists pointing at Vercel, this
 * is a no-op and returns the existing record id.
 */
export async function createSubdomainCname(
  subdomain: string
): Promise<{ id: string; hostname: string }> {
  const apex = process.env.APEX_DOMAIN ?? "yourshopfront.com"
  const hostname = `${subdomain}.${apex}`

  const existing = await findCnameByName(hostname)
  if (existing && existing.content === VERCEL_CNAME_TARGET) {
    return { id: existing.id, hostname }
  }

  const created = await cfFetch<{ id: string }>("/dns_records", {
    method: "POST",
    body: JSON.stringify({
      type: "CNAME",
      name: subdomain,
      content: VERCEL_CNAME_TARGET,
      ttl: 1, // 1 = "automatic" (5 min)
      proxied: false, // Vercel handles SSL; Cloudflare must not proxy.
    }),
  })

  return { id: created.id, hostname }
}

export async function deleteSubdomainCname(recordId: string): Promise<void> {
  await cfFetch<unknown>(`/dns_records/${recordId}`, { method: "DELETE" })
}
