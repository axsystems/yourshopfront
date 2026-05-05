import "server-only"

import { supabase } from "@/lib/supabase"

const RESERVED_SLUGS = new Set([
  "www",
  "api",
  "admin",
  "app",
  "dev",
  "staging",
  "test",
  "demo",
  "demos",
  "portfolio",
  "checkout",
  "onboarding",
  "pricing",
  "about",
  "contact",
  "blog",
  "docs",
  "help",
  "support",
  "status",
])

/**
 * Slugifies a business name into a DNS-safe segment. Lowercases, strips
 * accents, replaces non-alphanumeric runs with single hyphens, trims
 * leading/trailing hyphens, caps length at 40 chars.
 */
export function slugifyBusinessName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "")
}

/**
 * Returns the next available provision_slug for the given base. Tries
 * the bare base first, then `${base}-2`, `-3`, etc. until a free one
 * is found. Reserved system subdomains are always skipped.
 */
export async function findAvailableProvisionSlug(
  base: string
): Promise<string> {
  let normalized = slugifyBusinessName(base) || "site"
  if (RESERVED_SLUGS.has(normalized)) normalized = `${normalized}-co`

  let candidate = normalized
  let suffix = 2
  while (await isSlugTaken(candidate)) {
    candidate = `${normalized}-${suffix}`
    suffix += 1
    if (suffix > 999) {
      throw new Error(
        `findAvailableProvisionSlug: 999 collisions for base "${base}" — bailing`
      )
    }
  }
  return candidate
}

async function isSlugTaken(slug: string): Promise<boolean> {
  const { data, error } = await supabase()
    .from("sites")
    .select("id")
    .eq("provision_slug", slug)
    .limit(1)
  if (error) throw error
  return Array.isArray(data) && data.length > 0
}
