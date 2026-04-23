import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { households, userProfiles } from "@/server/db/schema"
import { getSessionUser } from "@/server/auth"

export type Profile = {
  userId: string
  householdId: number
}

export async function requireProfile(userId: string): Promise<Profile> {
  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: { userId: true, householdId: true },
  })
  if (existing) return existing

  const [household] = await db
    .insert(households)
    .values({ name: "My Household" })
    .returning({ id: households.id })

  const inserted = await db
    .insert(userProfiles)
    .values({ userId, householdId: household.id })
    .onConflictDoNothing({ target: userProfiles.userId })
    .returning({
      userId: userProfiles.userId,
      householdId: userProfiles.householdId,
    })

  if (inserted.length > 0) return inserted[0]

  await db.delete(households).where(eq(households.id, household.id))
  const winner = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
    columns: { userId: true, householdId: true },
  })
  if (!winner) throw new Error("Profile race resolution failed")
  return winner
}

export async function withProfile<T>(
  fn: (ctx: Profile) => Promise<T>,
): Promise<T> {
  const session = await getSessionUser()
  if (!session) throw new Error("Unauthorized")
  const profile = await requireProfile(session.userId)
  return fn(profile)
}
