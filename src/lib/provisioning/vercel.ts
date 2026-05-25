import "server-only"

/**
 * Minimal Vercel REST API client for the multi-tenant domain attach/detach
 * needed by Phase 5 provisioning. Single endpoint surface — adding domains
 * to the Your Shopfront project — so we don't pull in `@vercel/sdk`.
 *
 * Reference: https://vercel.com/docs/rest-api/endpoints/domains
 */

const VERCEL_API = "https://api.vercel.com"

interface VercelEnv {
  token: string
  teamId: string
  projectId: string
}

function loadEnv(): VercelEnv {
  const token = process.env.VERCEL_API_TOKEN
  const teamId = process.env.VERCEL_TEAM_ID
  const projectId = process.env.VERCEL_PROJECT_ID
  if (!token || !teamId || !projectId) {
    throw new Error(
      "vercel(): VERCEL_API_TOKEN, VERCEL_TEAM_ID, and VERCEL_PROJECT_ID must all be set"
    )
  }
  return { token, teamId, projectId }
}

async function request(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const { token, teamId } = loadEnv()
  const url = new URL(`${VERCEL_API}${path}`)
  url.searchParams.set("teamId", teamId)
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
}

/**
 * Adds a domain (e.g. "northridge-plumbing.yourshopfront.com") to the apex
 * Vercel project. Idempotent — if the domain is already attached, the
 * Vercel API returns 409 and we treat it as success.
 */
export async function addDomainToProject(domain: string): Promise<void> {
  const { projectId } = loadEnv()
  const res = await request(`/v10/projects/${projectId}/domains`, {
    method: "POST",
    body: JSON.stringify({ name: domain }),
  })

  if (res.ok) return

  // 409 = already attached. Treat as success for idempotency.
  if (res.status === 409) return

  const body = await res.text()
  throw new Error(
    `Vercel addDomainToProject(${domain}) failed: ${res.status} ${body}`
  )
}

/**
 * Removes a domain from the apex Vercel project. Used on cancellation /
 * cleanup. Idempotent — 404 from Vercel = "already gone" = success.
 */
export async function removeDomainFromProject(domain: string): Promise<void> {
  const { projectId } = loadEnv()
  const res = await request(
    `/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}`,
    { method: "DELETE" }
  )

  if (res.ok) return
  if (res.status === 404) return

  const body = await res.text()
  throw new Error(
    `Vercel removeDomainFromProject(${domain}) failed: ${res.status} ${body}`
  )
}

/**
 * Quick check used to short-circuit re-provisioning. Vercel's API
 * returns the domain object if attached, 404 if not.
 */
export async function isDomainAttached(domain: string): Promise<boolean> {
  const { projectId } = loadEnv()
  const res = await request(
    `/v9/projects/${projectId}/domains/${encodeURIComponent(domain)}`
  )
  if (res.ok) return true
  if (res.status === 404) return false
  const body = await res.text()
  throw new Error(
    `Vercel isDomainAttached(${domain}) failed: ${res.status} ${body}`
  )
}
