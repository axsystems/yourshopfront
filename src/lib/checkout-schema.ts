import { z } from "zod"

import { allThemesList, allThemeSlugs } from "@/lib/themes"

export const TierEnum = z.enum(["subscription", "onetime"])
export type Tier = z.infer<typeof TierEnum>

// Referral attribution codes (`ref` = payout key, `src` = channel). Shared
// between this schema and the client-side cookie helpers in
// src/lib/referral.ts so a value is only ever accepted once, in one place.
export const REFERRAL_CODE_REGEX = /^[a-z0-9][a-z0-9_-]{0,31}$/i

/**
 * The user-facing form fields. Tier and demo come from URL params and
 * are added by CheckoutRequestSchema below.
 */
export const CheckoutFormSchema = z.object({
  business_name: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(200, "Business name too long"),
  contact_name: z
    .string()
    .min(1, "Your name is required")
    .max(120, "Name too long"),
  // Stage 4 Hook 3 (email canonical-key policy): normalize at the boundary
  // so every stored email is lowercase + trimmed, matching the case-insensitive
  // lookups in src/lib/auth.ts and src/app/api/access/route.ts. Does NOT
  // retroactively fix rows written before this normalization existed.
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Valid email required")
    .max(200, "Email too long"),
  phone: z
    .string()
    .max(30, "Phone too long")
    .refine((p) => p === "" || p.replace(/\D/g, "").length >= 10, {
      message: "Phone must include at least 10 digits",
    })
    .optional()
    .or(z.literal("")),
  industry: z
    .string()
    .min(1, "Industry is required")
    .max(120, "Industry too long"),
  current_website_url: z
    .string()
    .url("Must be a valid URL (include https://)")
    .max(500)
    .or(z.literal(""))
    .optional(),
  hosting_addon: z.boolean(),
})

export type CheckoutFormData = z.infer<typeof CheckoutFormSchema>

/**
 * Full /api/checkout request body. Used by the client to submit and
 * by the Phase 4d API to validate.
 */
export const CheckoutRequestSchema = CheckoutFormSchema.extend({
  tier: TierEnum,
  demo: z
    .string()
    .refine((s) => allThemeSlugs.includes(s), { message: "Unknown demo slug" }),
  // "launch" → subscription tier swaps setup price to the promo $99 SKU
  // and applies STRIPE_COUPON_LAUNCH_PROMO ($50/mo off × 3 months).
  // Anything else, including absent, gets standard pricing.
  promo: z.enum(["launch"]).optional(),
  // copy_addon lives here (not in CheckoutFormSchema) so Stream B can wire
  // up the checkbox without form-level type changes until ready.
  // Defaults to false so existing clients that don't send the field keep working.
  copy_addon: z.boolean().default(false),
  // Referral attribution — both optional, both absent for every checkout
  // today. `ref` is WHO gets paid (a promoter's payout key, e.g. "payton");
  // `src` is WHICH channel drove the sale (e.g. "tiktok", "ig", "fb").
  // Captured client-side from ?ref=&src= into a 30-day cookie by
  // <ReferralCapture> (first-touch wins), read back by the checkout form.
  ref: z.string().regex(REFERRAL_CODE_REGEX, "Invalid referral code").optional(),
  src: z.string().regex(REFERRAL_CODE_REGEX, "Invalid referral source").optional(),
})

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>

/**
 * Industry options for the form's dropdown — every unique industry across
 * the 24 themes, alphabetically sorted. The schema doesn't constrain to
 * this list (custom industries from typing are valid) — this is UI-only.
 */
export const INDUSTRY_OPTIONS: string[] = Array.from(
  new Set(allThemesList.map((t) => t.industry))
).sort()
