import { REFERRAL_CODE_REGEX } from "@/lib/checkout-schema";

// =============================================================================
// Referral attribution — first-party cookie read/write
// =============================================================================
// `ref` = WHO gets paid (a promoter's payout key, e.g. "payton").
// `src` = WHERE the sale came from (a channel, e.g. "tiktok", "ig", "fb").
//
// Client-side only (document.cookie), not sessionStorage — TikTok/IG
// in-app browsers and the gap between watching a video and buying later
// both destroy sessionStorage. Cookies survive a full browser restart for
// 30 days, which is what a "watch on TikTok, buy next week" funnel needs.
//
// Both helpers re-validate against REFERRAL_CODE_REGEX defensively, so a
// corrupted/tampered cookie can never smuggle an invalid value into the
// checkout request body and block a real customer's checkout.
// =============================================================================

export const REFERRAL_REF_COOKIE = "ysf_ref";
export const REFERRAL_SRC_COOKIE = "ysf_src";

const REFERRAL_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  if (!row) return null;
  const raw = row.slice(name.length + 1);
  try {
    return decodeURIComponent(raw) || null;
  } catch {
    return null;
  }
}

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  // `Secure` keeps the payout key off plain-HTTP requests. It is applied
  // conditionally because browsers REFUSE to set a Secure cookie from an
  // http:// page — hardcoding it would silently kill referral capture on
  // `pnpm dev` (http://localhost:3000) and on LAN-IP device testing, and a
  // dropped first-touch cookie is a promoter losing their commission.
  // yourshopfront.com is HTTPS-only, so production always takes the Secure
  // branch; there is no environment where the flag is silently skipped in prod.
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${REFERRAL_COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax${secure}`;
}

/**
 * First-touch capture. Call with the current URL's `ref`/`src` query
 * params on every page load (see <ReferralCapture>). No-ops when:
 *   - `ref` is missing or fails validation (there's no payout key to
 *     capture, so `src` alone is never persisted — the two fields are
 *     treated as one unit).
 *   - a `ref` cookie already exists — the FIRST link a visitor clicks
 *     wins, so a promoter never loses credit to a later organic visit.
 * `ref` and `src` are written together so they never drift out of sync.
 */
export function captureReferral(ref: string | null, src: string | null): void {
  if (!ref || !REFERRAL_CODE_REGEX.test(ref)) return;
  if (readCookie(REFERRAL_REF_COOKIE)) return; // first-touch wins

  writeCookie(REFERRAL_REF_COOKIE, ref);
  if (src && REFERRAL_CODE_REGEX.test(src)) {
    writeCookie(REFERRAL_SRC_COOKIE, src);
  }
}

/**
 * Reads back the captured referral cookies for inclusion in the /api/checkout
 * request body. Returns `undefined` (not present in the object at all —
 * callers spread conditionally) for any value that's missing or invalid,
 * so a bad cookie never gets forwarded to the API and never blocks checkout.
 */
export function readReferralCookies(): { ref?: string; src?: string } {
  const ref = readCookie(REFERRAL_REF_COOKIE);
  const src = readCookie(REFERRAL_SRC_COOKIE);
  return {
    ...(ref && REFERRAL_CODE_REGEX.test(ref) ? { ref } : {}),
    ...(src && REFERRAL_CODE_REGEX.test(src) ? { src } : {}),
  };
}
