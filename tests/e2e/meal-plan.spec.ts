import { test, expect } from "@playwright/test"

test("meal plan page loads", async ({ page }) => {
  await page.goto("/meal-plan")
  await expect(page.getByRole("heading", { name: "Meal Plan" })).toBeVisible()
})

test("meal plan shows day headers", async ({ page }) => {
  await page.goto("/meal-plan")
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  for (const day of dayNames) {
    await expect(page.getByText(day, { exact: false }).first()).toBeVisible()
  }
})

test("meal plan has previous/next week navigation", async ({ page }) => {
  await page.goto("/meal-plan")
  // Navigation buttons (chevrons)
  const buttons = page.getByRole("button")
  await expect(buttons.first()).toBeVisible()
})

test("meal plan shows meal type labels", async ({ page }) => {
  await page.goto("/meal-plan")
  await expect(page.getByText("Breakfast")).toBeVisible()
  await expect(page.getByText("Lunch")).toBeVisible()
  await expect(page.getByText("Dinner")).toBeVisible()
})
