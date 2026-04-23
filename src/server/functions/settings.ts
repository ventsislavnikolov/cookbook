import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { households } from "@/server/db/schema"
import { withProfile } from "@/server/profile"

export const getHousehold = createServerFn({ method: "GET" }).handler(() =>
  withProfile(async ({ householdId }) => {
    const household = await db.query.households.findFirst({
      where: eq(households.id, householdId),
    })
    if (!household) throw new Error("Household not found")
    return household
  }),
)

export const updateHouseholdName = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string }) => data)
  .handler(({ data }) =>
    withProfile(async ({ householdId }) => {
      await db
        .update(households)
        .set({ name: data.name.trim() })
        .where(eq(households.id, householdId))
      return { success: true }
    }),
  )
