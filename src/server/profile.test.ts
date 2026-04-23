import { describe, expect, it } from "vitest"
import { randomUUID } from "crypto"
import { db } from "@/server/db"
import { households, userProfiles } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { requireProfile } from "@/server/profile"

async function clearProfile(userId: string) {
  const existing = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, userId),
  })
  if (existing) {
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId))
    await db.delete(households).where(eq(households.id, existing.householdId))
  }
}

describe("requireProfile", () => {
  it("provisions a profile and household on first call", async () => {
    const userId = `test-${randomUUID()}`
    await clearProfile(userId)
    const profile = await requireProfile(userId)
    expect(profile.userId).toBe(userId)
    expect(typeof profile.householdId).toBe("number")
    const row = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId),
    })
    expect(row?.householdId).toBe(profile.householdId)
    await clearProfile(userId)
  })

  it("returns the existing profile on second call", async () => {
    const userId = `test-${randomUUID()}`
    await clearProfile(userId)
    const first = await requireProfile(userId)
    const second = await requireProfile(userId)
    expect(second.householdId).toBe(first.householdId)
    await clearProfile(userId)
  })
})
