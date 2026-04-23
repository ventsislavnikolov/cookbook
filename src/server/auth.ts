import { getRequest } from "@tanstack/react-start/server"

export type SessionUser = {
  userId: string
  email: string | null
  name: string | null
}

type GetSessionResponse = {
  user: { id: string; email?: string | null; name?: string | null } | null
  session: { id: string; userId: string; expiresAt: string } | null
} | null

export async function getSessionUser(): Promise<SessionUser | null> {
  const baseUrl = process.env.VITE_NEON_AUTH_URL
  if (!baseUrl) return null

  const request = getRequest()
  const cookie = request.headers.get("cookie")
  if (!cookie) return null

  let res: Response
  try {
    res = await fetch(`${baseUrl}/get-session`, {
      headers: { cookie, accept: "application/json" },
    })
  } catch {
    return null
  }

  if (!res.ok) return null

  let body: GetSessionResponse
  try {
    body = (await res.json()) as GetSessionResponse
  } catch {
    return null
  }

  if (!body || !body.user) return null

  return {
    userId: body.user.id,
    email: body.user.email ?? null,
    name: body.user.name ?? null,
  }
}
