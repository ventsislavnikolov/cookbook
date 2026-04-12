import { test, expect } from "@playwright/test"

test("collections page loads", async ({ page }) => {
  await page.goto("/collections")
  await expect(page.getByRole("heading", { name: "Collections" })).toBeVisible()
  await expect(page.getByRole("button", { name: "New Collection" }).first()).toBeVisible()
})

test("create collection dialog opens", async ({ page }) => {
  await page.goto("/collections")
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "New Collection" }).first().click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.getByRole("heading", { name: "New Collection" })).toBeVisible()
})

test("can create a collection", async ({ page }) => {
  await page.goto("/collections")
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "New Collection" }).first().click()

  const name = `Test Collection ${Date.now()}`
  await page.getByPlaceholder("e.g. Weeknight dinners").fill(name)
  await page.getByRole("button", { name: "Create" }).click()

  // Dialog closes and collection appears in list
  await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 })
  await expect(page.getByText(name)).toBeVisible()
})

test("create collection dialog can be cancelled", async ({ page }) => {
  await page.goto("/collections")
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "New Collection" }).first().click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.getByRole("button", { name: "Cancel" }).click()
  await expect(page.getByRole("dialog")).not.toBeVisible()
})

test("can navigate to a collection detail page", async ({ page }) => {
  // Create a collection first
  await page.goto("/collections")
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "New Collection" }).first().click()
  const name = `Nav Test ${Date.now()}`
  await page.getByPlaceholder("e.g. Weeknight dinners").fill(name)
  await page.getByRole("button", { name: "Create" }).click()
  await expect(page.getByText(name)).toBeVisible({ timeout: 5000 })

  // Click the collection card
  await page.getByText(name).click()
  await expect(page).toHaveURL(/\/collections\/\d+/)
  await expect(page.getByText(name)).toBeVisible()
})
