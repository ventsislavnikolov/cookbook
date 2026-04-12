import { createMiddleware, createStart } from "@tanstack/react-start"
import { auth } from "@/server/auth"

const authHandler = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url)
  if (url.pathname.startsWith("/api/auth/")) {
    return auth.handler(request)
  }
  return next()
})

export const startInstance = createStart(() => ({
  requestMiddleware: [authHandler],
}))
