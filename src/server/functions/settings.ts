import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { eq } from "drizzle-orm"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { households } from "@/server/db/schema"

type SessionUser = {
  id: number
  householdId: number
  name: string
  email: string
}

async function requireSession() {
  const request = getRequest()
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw new Error("Unauthorized")
  return session as typeof session & { user: SessionUser }
}

export const getHousehold = createServerFn({ method: "GET" }).handler(async () => {
  const session = await requireSession()
  const household = await db.query.households.findFirst({
    where: eq(households.id, session.user.householdId),
  })
  if (!household) throw new Error("Household not found")
  return household
})

export const updateHouseholdName = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const session = await requireSession()
    await db
      .update(households)
      .set({ name: data.name.trim() })
      .where(eq(households.id, session.user.householdId))
    return { success: true }
  })
