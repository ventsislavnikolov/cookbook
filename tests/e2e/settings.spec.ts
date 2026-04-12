import { test, expect } from "@playwright/test"

test("settings page loads", async ({ page }) => {
  await page.goto("/settings")
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()
})

test("settings shows profile card", async ({ page }) => {
  await page.goto("/settings")
  await expect(page.locator('[data-slot="card-title"]').filter({ hasText: "Profile" })).toBeVisible()
  await expect(page.getByPlaceholder("Your name")).toBeVisible()
})

test("settings shows household card", async ({ page }) => {
  await page.goto("/settings")
  await expect(page.locator('[data-slot="card-title"]').filter({ hasText: "Household" })).toBeVisible()
  await expect(page.getByPlaceholder("e.g. The Johnson Family")).toBeVisible()
})

test("settings shows account card with sign out", async ({ page }) => {
  await page.goto("/settings")
  await expect(page.locator('[data-slot="card-title"]').filter({ hasText: "Account" })).toBeVisible()
  await expect(page.locator("main").getByRole("button", { name: "Sign out" })).toBeVisible()
})

test("can update household name", async ({ page }) => {
  await page.goto("/settings")
  await page.waitForLoadState("networkidle")
  const input = page.getByPlaceholder("e.g. The Johnson Family")
  await input.clear()
  const name = `Test Kitchen ${Date.now()}`
  await input.fill(name)
  await page.locator("main").getByRole("button", { name: "Save household" }).click()
  // Button shows "Saved!" feedback
  await expect(page.getByRole("button", { name: "Saved!" })).toBeVisible({ timeout: 5000 })
})

test("sign out redirects to /sign-in", async ({ page }) => {
  await page.goto("/settings")
  await page.waitForLoadState("networkidle")
  await page.locator("main").getByRole("button", { name: "Sign out" }).click()
  await expect(page).toHaveURL(/sign-in/, { timeout: 10000 })
})
