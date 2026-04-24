import { createAuthClient } from "@neondatabase/neon-js/auth"
import { BetterAuthReactAdapter } from "@neondatabase/neon-js/auth/react"

const baseUrl =
  typeof window !== "undefined"
    ? window.location.origin
    : (import.meta.env.VITE_APP_URL ?? "http://localhost:3000")

export const authClient = createAuthClient(baseUrl, {
  adapter: BetterAuthReactAdapter(),
})
