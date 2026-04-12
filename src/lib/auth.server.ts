import { getRequest } from "@tanstack/react-start/server"
import { eq } from "drizzle-orm"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { users } from "@/server/db/schema"

export type AuthSession = {
  userId: string
  householdId: number
  name: string
  email: string
}

async function resolveDbUser(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
    columns: { id: true, householdId: true, name: true, email: true },
  })
}

export async function requireAuth(): Promise<AuthSession> {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error("Unauthorized")

  const dbUser = await resolveDbUser(session.user.email)
  if (!dbUser) throw new Error("User not found")

  return {
    userId: dbUser.id,
    householdId: dbUser.householdId,
    name: dbUser.name,
    email: dbUser.email,
  }
}

export async function getSessionServer(): Promise<AuthSession | null> {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return null

  const dbUser = await resolveDbUser(session.user.email)
  if (!dbUser) return null

  return {
    userId: dbUser.id,
    householdId: dbUser.householdId,
    name: dbUser.name,
    email: dbUser.email,
  }
}
