"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { captureReferral } from "@/lib/referral";

/**
 * App-wide, invisible referral capture. Mounted once in the root layout
 * (inside a <Suspense> boundary — useSearchParams requires one in Next 16).
 *
 * Reads `ref` (payout key, e.g. "payton") and `src` (channel, e.g. "tiktok")
 * from the URL on every page and persists them to first-party cookies via
 * captureReferral() — 30-day expiry, first-touch wins. Renders nothing.
 *
 * A link like https://yourshopfront.com/start?ref=payton&src=tiktok hits
 * this on the very first page load; a plain visit with no params is a
 * no-op and leaves checkout behavior byte-for-byte unchanged.
 */
export function ReferralCapture() {
  const searchParams = useSearchParams();
  const ref = searchParams?.get("ref") ?? null;
  const src = searchParams?.get("src") ?? null;

  React.useEffect(() => {
    captureReferral(ref, src);
  }, [ref, src]);

  return null;
}
