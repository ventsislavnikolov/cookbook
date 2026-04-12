import { test, expect } from "@playwright/test"

test("cook log page loads", async ({ page }) => {
  await page.goto("/cook-log")
  await expect(page.getByRole("heading", { name: "Cook Log" })).toBeVisible()
})

test("cook log shows streak and goals section", async ({ page }) => {
  await page.goto("/cook-log")
  // Streak stat card should be visible
  await expect(page.getByText(/Cooking streak/i)).toBeVisible()
})

test("log cook button opens dialog", async ({ page }) => {
  await page.goto("/cook-log")
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "Log Cook" }).first().click()
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 })
  await expect(page.getByRole("heading", { name: "Choose a recipe" })).toBeVisible()
})

test("log cook dialog can be dismissed", async ({ page }) => {
  await page.goto("/cook-log")
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "Log Cook" }).first().click()
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 })
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).not.toBeVisible()
})

test("can log a cook with a recipe", async ({ page }) => {
  // First create a recipe to log against
  await page.goto("/recipes/new")
  await page.waitForLoadState("networkidle")
  const title = `Cookable ${Date.now()}`
  await page.getByLabel("Title").fill(title)
  await page.getByRole("button", { name: "Create recipe" }).click()
  await expect(page).toHaveURL(/\/recipes\/\d+/, { timeout: 10000 })

  // Now go to cook log and log it
  await page.goto("/cook-log")
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "Log Cook" }).first().click()
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 })

  // Search for the recipe
  await page.getByPlaceholder("Search recipes…").fill(title)
  await expect(page.getByText(title)).toBeVisible({ timeout: 5000 })
  await page.getByText(title).click()

  await page.getByRole("button", { name: "Save" }).click()
  await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 })

  // Entry should appear in log
  await expect(page.getByText(title)).toBeVisible()
})
