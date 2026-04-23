import { test as setup, expect } from "@playwright/test"
import { fileURLToPath } from "url"
import path from "path"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const authFile = path.join(__dirname, ".auth/user.json")

export const TEST_USER = {
  name: "E2E Tester",
  email: "e2e-test@cookbook.test",
  password: "testpassword123",
}

const NEON_AUTH_URL = process.env.VITE_NEON_AUTH_URL
if (!NEON_AUTH_URL) {
  throw new Error("VITE_NEON_AUTH_URL is not set")
}

setup("create test account", async ({ page }) => {
  const origin = "http://localhost:3000"
  const headers = {
    "Content-Type": "application/json",
    Origin: origin,
  }

  // Try signing in first; if the account doesn't exist, sign up
  let sessionCookie: string | undefined

  const signInRes = await fetch(`${NEON_AUTH_URL}/sign-in/email`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
    }),
  })

  if (signInRes.ok) {
    sessionCookie = signInRes.headers.get("set-cookie") ?? undefined
  } else {
    const signUpRes = await fetch(`${NEON_AUTH_URL}/sign-up/email`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: TEST_USER.name,
        email: TEST_USER.email,
        password: TEST_USER.password,
      }),
    })
    if (!signUpRes.ok) {
      const body = await signUpRes.text()
      throw new Error(`Sign-up failed (${signUpRes.status}): ${body}`)
    }

    // Sign in after sign-up to obtain session cookie
    const signInAfterRes = await fetch(`${NEON_AUTH_URL}/sign-in/email`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
      }),
    })
    if (!signInAfterRes.ok) {
      const body = await signInAfterRes.text()
      throw new Error(`Sign-in after sign-up failed (${signInAfterRes.status}): ${body}`)
    }
    sessionCookie = signInAfterRes.headers.get("set-cookie") ?? undefined
  }

  if (!sessionCookie) {
    throw new Error("No session cookie returned by Neon Auth")
  }

  // Extract the cookie name and value (strip attributes like Path, Max-Age, etc.)
  const cookieParts = sessionCookie.split(";")[0].trim()
  const eqIdx = cookieParts.indexOf("=")
  const cookieName = cookieParts.slice(0, eqIdx)
  const cookieValue = cookieParts.slice(eqIdx + 1)

  // Store the Neon Auth session cookie for localhost so the app's server-side
  // auth proxy can forward it to Neon Auth's /get-session endpoint.
  // Chromium rejects __Secure-* cookies without Secure=true; localhost is
  // treated as a secure context, so Secure=true is valid here.
  await page.context().addCookies([
    {
      name: cookieName,
      value: cookieValue,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "None",
    },
  ])

  // Verify we can access a protected route
  await page.goto("/")
  await expect(page).not.toHaveURL(/sign-in/, { timeout: 10000 })

  // Save storage state (cookies) for subsequent tests
  await page.context().storageState({ path: authFile })
})
