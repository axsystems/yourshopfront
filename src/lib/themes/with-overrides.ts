import type { Theme } from "./types"

export interface TenantOverrides {
  /** Customer's actual business name. Replaces theme.name throughout. */
  businessName?: string
  /** Customer's actual industry label. Replaces theme.industry. */
  industry?: string
}

/**
 * Returns a shallow clone of `base` with tenant fields swapped in. Used by
 * the multi-tenant route at `/_tenant` so a customer's subdomain shows
 * their business name where the demo had its placeholder.
 *
 * Color, fonts, hero pattern, button shape, and copy beyond the name are
 * preserved — Phase 5 v1 only swaps the name. Real per-customer copy
 * overlay (services, testimonials, hero text) requires a content-storage
 * layer that's out of scope for this commit.
 */
export function applyTenantOverrides(
  base: Theme,
  overrides: TenantOverrides
): Theme {
  return {
    ...base,
    name: overrides.businessName?.trim() || base.name,
    industry: overrides.industry?.trim() || base.industry,
  }
}
