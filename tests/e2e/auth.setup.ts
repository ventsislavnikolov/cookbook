import { test as setup, expect, request } from "@playwright/test"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const authFile = path.join(__dirname, ".auth/user.json")

export const TEST_USER = {
  name: "E2E Tester",
  email: "e2e-test@cookbook.test",
  password: "testpassword123",
}

const BASE = "http://localhost:3000"

setup("create test account", async ({ page }) => {
  // Try signing in via API — if it works, use the session cookie
  const apiCtx = await request.newContext({ baseURL: BASE })

  const signInRes = await apiCtx.post("/api/auth/sign-in/email", {
    data: { email: TEST_USER.email, password: TEST_USER.password },
  })

  if (!signInRes.ok()) {
    // User doesn't exist — create via sign-up API
    const signUpRes = await apiCtx.post("/api/auth/sign-up/email", {
      data: {
        name: TEST_USER.name,
        email: TEST_USER.email,
        password: TEST_USER.password,
      },
    })
    if (!signUpRes.ok()) {
      const body = await signUpRes.text()
      throw new Error(`Sign-up failed (${signUpRes.status()}): ${body}`)
    }
  }

  // Get the session cookie from the API context and give it to the browser page
  const cookies = await apiCtx.storageState()
  await page.context().addCookies(
    cookies.cookies.map((c) => ({ ...c, domain: "localhost" })),
  )

  // Verify we can access a protected route
  await page.goto("/")
  await expect(page).not.toHaveURL(/sign-in/, { timeout: 10000 })

  // Save storage state (cookies) for subsequent tests
  await page.context().storageState({ path: authFile })
  await apiCtx.dispose()
})
