import { test, expect } from "@playwright/test"

test("dashboard loads at /", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible()
})

test("dashboard shows stat cards", async ({ page }) => {
  await page.goto("/")
  // "Recipes" and "Favorites" also appear in sidebar, use first() to avoid strict mode
  await expect(page.getByText("Recipes").first()).toBeVisible()
  await expect(page.getByText("Favorites").first()).toBeVisible()
  await expect(page.getByText("Cooked this week")).toBeVisible()
  await expect(page.getByText("Today's meals")).toBeVisible()
})

test("dashboard quick links navigate to main sections", async ({ page }) => {
  await page.goto("/")
  // Use href selectors — sidebar + quick link cards both have these hrefs, first() works
  await expect(page.locator('a[href="/recipes"]').first()).toBeVisible()
  await expect(page.locator('a[href="/collections"]').first()).toBeVisible()
  await expect(page.locator('a[href="/meal-plan"]').first()).toBeVisible()
  await expect(page.locator('a[href="/cook-log"]').first()).toBeVisible()
})

test("clicking Recipes quick link navigates to /recipes", async ({ page }) => {
  await page.goto("/")
  // Click quick-link card (not sidebar)
  await page.locator('a[href="/recipes"]').first().click()
  await expect(page).toHaveURL(/\/recipes/)
})
