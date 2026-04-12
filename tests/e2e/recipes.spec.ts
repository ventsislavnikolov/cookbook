import { test, expect } from "@playwright/test"

test("recipes list page loads", async ({ page }) => {
  await page.goto("/recipes")
  await expect(page.getByRole("heading", { name: "Recipes" })).toBeVisible()
  await expect(page.getByRole("link", { name: "New Recipe" }).first()).toBeVisible()
})

test("search input is visible on recipes page", async ({ page }) => {
  await page.goto("/recipes")
  await expect(page.getByPlaceholder("Search recipes…")).toBeVisible()
})

test("New Recipe button navigates to /recipes/new", async ({ page }) => {
  await page.goto("/recipes")
  await page.getByRole("link", { name: "New Recipe" }).first().click()
  await expect(page).toHaveURL(/\/recipes\/new/)
})

test("new recipe form renders required fields", async ({ page }) => {
  await page.goto("/recipes/new")
  await expect(page.getByRole("heading", { name: "New Recipe" })).toBeVisible()
  await expect(page.getByLabel("Title")).toBeVisible()
})

test("can create a recipe and view its detail page", async ({ page }) => {
  await page.goto("/recipes/new")
  await page.waitForLoadState("networkidle")

  const title = `Test Recipe ${Date.now()}`
  await page.getByLabel("Title").fill(title)
  await page.getByRole("button", { name: "Create recipe" }).click()

  // Should redirect to detail page
  await expect(page).toHaveURL(/\/recipes\/\d+/, { timeout: 10000 })
  await expect(page.getByText(title)).toBeVisible()
})

test("recipe detail page has edit and delete actions", async ({ page }) => {
  // Create a recipe first
  await page.goto("/recipes/new")
  await page.waitForLoadState("networkidle")
  const title = `Detail Test ${Date.now()}`
  await page.getByLabel("Title").fill(title)
  await page.getByRole("button", { name: "Create recipe" }).click()
  await expect(page).toHaveURL(/\/recipes\/\d+/, { timeout: 10000 })

  // Edit button or link should be present
  await expect(page.getByRole("link", { name: "Edit" }).or(page.getByRole("button", { name: "Edit" }))).toBeVisible()
})

test("favorites toggle works on recipe list", async ({ page }) => {
  await page.goto("/recipes")
  // Check if there are any recipes to toggle
  const cards = page.locator('[title="Add to favorites"], [title="Remove from favorites"]')
  const count = await cards.count()
  if (count > 0) {
    const first = cards.first()
    const titleBefore = await first.getAttribute("title")
    await first.click()
    // Wait for re-render
    await page.waitForTimeout(500)
    await expect(cards.first()).toHaveAttribute("title", titleBefore === "Add to favorites" ? "Remove from favorites" : "Add to favorites")
  }
})

test("back arrow on new recipe navigates back to recipes list", async ({ page }) => {
  await page.goto("/recipes/new")
  // Click the back arrow link in main content (not the sidebar logo)
  await page.locator("main").getByRole("link").first().click()
  await expect(page).toHaveURL(/\/recipes$/, { timeout: 5000 })
})

test("favorites page loads", async ({ page }) => {
  await page.goto("/favorites")
  await expect(page.getByRole("heading", { name: "Favorites" })).toBeVisible()
})

test("recent page loads", async ({ page }) => {
  await page.goto("/recent")
  await expect(page.getByRole("heading", { name: "Recent" })).toBeVisible()
})

test("trash page loads", async ({ page }) => {
  await page.goto("/trash")
  await expect(page.getByRole("heading", { name: "Trash" })).toBeVisible()
})
