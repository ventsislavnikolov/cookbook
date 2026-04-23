import { createAuthClient } from "@neondatabase/neon-js/auth"
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react"

const baseUrl = import.meta.env.VITE_NEON_AUTH_URL
if (!baseUrl) {
  throw new Error("VITE_NEON_AUTH_URL is not set")
}

export const authClient = createAuthClient(baseUrl, {
  adapter: BetterAuthReactAdapter(),
})
