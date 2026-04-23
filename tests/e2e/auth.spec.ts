import { test, expect } from "@playwright/test"

// These tests use no storageState — verifying unauthenticated behaviour
test.use({ storageState: { cookies: [], origins: [] } })

test("unauthenticated / redirects to /sign-in", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveURL(/sign-in/)
})

test("unauthenticated /recipes redirects to /sign-in", async ({ page }) => {
  await page.goto("/recipes")
  await expect(page).toHaveURL(/sign-in/)
})

test("sign-in page renders", async ({ page }) => {
  await page.goto("/sign-in")
  await expect(page.getByRole("heading", { name: "Sign in to Cookbook" })).toBeVisible()
  await expect(page.getByLabel("Email")).toBeVisible()
  await expect(page.getByLabel("Password")).toBeVisible()
})

test("sign-up page renders", async ({ page }) => {
  await page.goto("/sign-up")
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible()
  await expect(page.getByLabel("Name")).toBeVisible()
  await expect(page.getByLabel("Email")).toBeVisible()
  await expect(page.getByLabel("Password")).toBeVisible()
})

test("sign-in with wrong password shows error", async ({ page }) => {
  await page.goto("/sign-in")
  await page.waitForLoadState("networkidle")
  await page.getByLabel("Email").fill("nobody@example.com")
  await page.getByLabel("Password").fill("wrongpassword")
  await page.getByRole("button", { name: "Sign in" }).click()
  await expect(page.locator(".text-destructive")).toBeVisible({ timeout: 15000 })
})

test("sign-in page links to sign-up", async ({ page }) => {
  await page.goto("/sign-in")
  await page.getByRole("link", { name: "Sign up" }).click()
  await expect(page).toHaveURL(/sign-up/)
})

test("sign-up page links to sign-in", async ({ page }) => {
  await page.goto("/sign-up")
  await page.getByRole("link", { name: "Sign in" }).click()
  await expect(page).toHaveURL(/sign-in/)
})
