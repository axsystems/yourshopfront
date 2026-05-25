import { test, expect } from "@playwright/test"

/**
 * Your Shopfront — smoke tests. Master brief §2 #14:
 *   1. home loads
 *   2. /pricing loads
 *   3. /portfolio loads
 *   4. /demos/heritage-painters loads
 *   5. /api/og/heritage-painters returns 200 with image/png
 *
 * Each test asserts a meaningful piece of rendered content (not just a 200) so
 * a regression that ships a blank page doesn't pass.
 */

test("home loads with chrome + hero", async ({ page }) => {
  const response = await page.goto("/")
  expect(response?.status(), "home should respond 200").toBe(200)
  await expect(page.locator("main h1")).toContainText("Websites that")
  await expect(page.locator("main h1")).toContainText("more jobs")
  // Hero CTA mentions the design count. Don't pin the exact number — the
   // theme catalog grows; pin only the shape.
   await expect(page.locator("a", { hasText: /See the \d+ designs/i })).toBeVisible()
})

test("/pricing loads with both tier cards", async ({ page }) => {
  const response = await page.goto("/pricing")
  expect(response?.status(), "/pricing should respond 200").toBe(200)
  await expect(page.locator("h1")).toContainText("Two ways to buy")
  await expect(page.getByText("Subscription").first()).toBeVisible()
  await expect(page.getByText("One-time build").first()).toBeVisible()
})

test("/portfolio loads with filter chips", async ({ page }) => {
  const response = await page.goto("/portfolio")
  expect(response?.status(), "/portfolio should respond 200").toBe(200)
  await expect(page.locator("h1")).toContainText("Every design we ship")
  // Filter row has at least the "All rounds" chip
  await expect(page.getByRole("button", { name: /all rounds/i })).toBeVisible()
})

test("/demos/heritage-painters loads themed", async ({ page }) => {
  const response = await page.goto("/demos/heritage-painters")
  expect(response?.status(), "demo route should respond 200").toBe(200)
  // Themed Hero renders an h1 — we don't assert exact text because it varies
  // per theme via previewHeadline(). We assert the demo page didn't 404.
  await expect(page.locator("main h1")).toBeVisible()
})

test("/api/og/heritage-painters returns 200 + image/png", async ({ request }) => {
  const response = await request.get("/api/og/heritage-painters")
  expect(response.status(), "OG route should respond 200").toBe(200)
  const contentType = response.headers()["content-type"] ?? ""
  expect(contentType).toContain("image/png")
})
