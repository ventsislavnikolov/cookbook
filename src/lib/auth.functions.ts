import { createServerFn } from "@tanstack/react-start"
import type { AuthSession } from "./auth.server"

export type { AuthSession }

export const getSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthSession | null> => {
    const { getSessionServer } = await import("./auth.server")
    return getSessionServer()
  },
)
