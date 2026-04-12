import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { eq } from "drizzle-orm"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { users } from "@/server/db/schema"

export type AuthSession = {
  userId: number
  householdId: number
  name: string
  email: string
}

export async function requireAuth(): Promise<AuthSession> {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error("Unauthorized")

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
    columns: { id: true, householdId: true, name: true, email: true },
  })
  if (!dbUser) throw new Error("User not found")

  return {
    userId: dbUser.id,
    householdId: dbUser.householdId,
    name: dbUser.name,
    email: dbUser.email,
  }
}

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) return null

  const dbUser = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
    columns: { id: true, householdId: true, name: true, email: true },
  })
  if (!dbUser) return null

  return {
    userId: dbUser.id,
    householdId: dbUser.householdId,
    name: dbUser.name,
    email: dbUser.email,
  }
})
