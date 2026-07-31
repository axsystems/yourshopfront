// Single source of truth for user-visible pricing copy.
//
// Standard pricing: $299 setup + $149/mo, or $997 one-time.
// Launch promo (currently live): $99 setup + $99/mo for the first
// PROMO_MONTHS months, then $149/mo standard.
//
// This file is DISPLAY ONLY — it does not change what Stripe actually
// charges. The real amounts live in Stripe (price IDs) and are read server-
// side in src/lib/stripe.ts / src/lib/checkout-schema.ts. If you change a
// number here without also updating the Stripe price/coupon, the site will
// quote one number and charge another.
//
// Every user-visible price string should route through this file instead of
// a new hardcoded literal — that's what let $99 drift out of sync with
// /pricing in the first place.

// PROMO_TRIAL_DAYS is the one constant in this file that is NOT display-only:
// it is passed to Stripe as subscription_data.trial_period_days on the promo
// path (src/app/api/checkout/route.ts). It lives here so the charged behaviour
// and the "first month free" copy cannot drift apart.
export const PROMO_TRIAL_DAYS = 30

export const PROMO_SETUP_PRICE = 99
export const PROMO_MONTHLY_PRICE = 99
export const PROMO_MONTHS = 3
export const STANDARD_SETUP_PRICE = 299
export const STANDARD_MONTHLY_PRICE = 149
export const ONE_TIME_PRICE = 997
export const HOSTING_ADDON_PRICE = 49

export const PROMO_SETUP = `$${PROMO_SETUP_PRICE}`
export const PROMO_MONTHLY = `$${PROMO_MONTHLY_PRICE}/mo`
export const STANDARD_SETUP = `$${STANDARD_SETUP_PRICE}`
export const STANDARD_MONTHLY = `$${STANDARD_MONTHLY_PRICE}/mo`
export const ONE_TIME = `$${ONE_TIME_PRICE}`
export const HOSTING_ADDON = `$${HOSTING_ADDON_PRICE}/mo`

// Derived totals — computed from the base prices above so they can't drift
// out of sync with them. Render with a literal "$" prefix, e.g. `${PROMO_TODAY_CHARGE}`.
// Only the setup fee is charged today: the subscription starts with a
// PROMO_TRIAL_DAYS trial, so the first monthly invoice lands after it ends.
export const PROMO_TODAY_CHARGE = PROMO_SETUP_PRICE
export const STANDARD_TODAY_CHARGE = STANDARD_SETUP_PRICE + STANDARD_MONTHLY_PRICE
export const PROMO_FIRST_PERIOD_TOTAL =
  PROMO_SETUP_PRICE + PROMO_MONTHLY_PRICE * PROMO_MONTHS
export const STANDARD_FIRST_PERIOD_TOTAL =
  STANDARD_SETUP_PRICE + STANDARD_MONTHLY_PRICE * PROMO_MONTHS
export const FIRST_PERIOD_SAVINGS = STANDARD_FIRST_PERIOD_TOTAL - PROMO_FIRST_PERIOD_TOTAL
export const SETUP_SAVINGS = STANDARD_SETUP_PRICE - PROMO_SETUP_PRICE
export const MONTHLY_SAVINGS = STANDARD_MONTHLY_PRICE - PROMO_MONTHLY_PRICE

// Composed copy — reused verbatim across multiple marketing surfaces.
export const PROMO_PERIOD_LABEL = `today, first month free, then ${PROMO_MONTHLY} for ${PROMO_MONTHS} months (${STANDARD_MONTHLY} after)`

// Order-summary row labels. Derived from PROMO_MONTHS so the month
// boundaries cannot drift from the coupon's actual duration: the trial
// covers month 1, the coupon then discounts PROMO_MONTHS invoices.
export const PROMO_TRIAL_ROW_LABEL = "First month"
export const PROMO_TRIAL_ROW_AMOUNT = "Free"
export const PROMO_DISCOUNT_ROWS_LABEL = `Months 2 \u2013 ${1 + PROMO_MONTHS}`
export const PROMO_STANDARD_ROW_LABEL = `Month ${2 + PROMO_MONTHS} onward`

// The offer in one line, for hero + CTA surfaces.
export const PROMO_OFFER_HEADLINE = `$${PROMO_SETUP_PRICE} today. First month free.`
export const PROMO_OFFER_DETAIL = `Then ${PROMO_MONTHLY} for ${PROMO_MONTHS} months, then ${STANDARD_MONTHLY}. Cancel any time.`
