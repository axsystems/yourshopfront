import { defineConfig, devices } from "@playwright/test"

/**
 * Apex Sites Playwright config — minimal smoke suite (master brief §2 #14).
 *
 * Run: pnpm test:e2e
 *
 * Spawns a production build (pnpm build && pnpm start) on port 3100 (we use a
 * non-default port so an existing dev server doesn't collide). Runs the 5
 * smoke tests in tests/e2e/smoke.spec.ts against it.
 *
 * On CI, Playwright's webServer reuses a running server if one is already up;
 * locally, it builds + starts a fresh one each invocation. webServer.timeout
 * is generous (4 minutes) because next build can take a minute on cold caches.
 */

const PORT = 3100

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // pnpm exec next start -p {PORT} after a fresh production build.
    command: `pnpm build && pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    stdout: "ignore",
    stderr: "pipe",
  },
})
