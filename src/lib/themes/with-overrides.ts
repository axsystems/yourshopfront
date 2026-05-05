import type { Theme } from "./types"

export interface TenantOverrides {
  /** Customer's actual business name. Replaces theme.name throughout. */
  businessName?: string
  /** Customer's actual industry label. Replaces theme.industry. */
  industry?: string
}

/**
 * Returns a shallow clone of `base` with tenant fields swapped in. Used by
 * the multi-tenant route at `/_tenant` so theme-driven surfaces (the
 * "Coming soon" interstitial; any future themed banner) carry the
 * customer's business name instead of the demo placeholder.
 *
 * Real per-customer copy (services, hero, contact) does NOT live here — it
 * lives in `sites.site_content` and is rendered by `<CustomerHome>` from
 * `src/components/tenant/`. This helper is only for places where a
 * Theme-shaped object is needed (e.g. ThemeProvider tokens).
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
