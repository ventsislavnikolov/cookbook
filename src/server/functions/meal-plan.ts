import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { and, eq, gte, lt } from "drizzle-orm"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { mealPlanEntries, recipes } from "@/server/db/schema"

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

// weekStart: ISO date string e.g. "2026-04-07"
export const getMealPlan = createServerFn({ method: "GET" })
  .inputValidator((data: { weekStart: string }) => data)
  .handler(async ({ data }) => {
    const session = await requireSession()
    const start = new Date(data.weekStart)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)

    return db
      .select({
        id: mealPlanEntries.id,
        plannedDate: mealPlanEntries.plannedDate,
        mealType: mealPlanEntries.mealType,
        servings: mealPlanEntries.servings,
        notes: mealPlanEntries.notes,
        recipe: {
          id: recipes.id,
          title: recipes.title,
          cuisine: recipes.cuisine,
          difficulty: recipes.difficulty,
        },
      })
      .from(mealPlanEntries)
      .innerJoin(recipes, eq(mealPlanEntries.recipeId, recipes.id))
      .where(
        and(
          eq(mealPlanEntries.householdId, session.user.householdId),
          gte(mealPlanEntries.plannedDate, start),
          lt(mealPlanEntries.plannedDate, end),
        ),
      )
  })

export const setMealPlanEntry = createServerFn({ method: "POST" })
  .inputValidator((data: { plannedDate: string; mealType: string; recipeId: number }) => data)
  .handler(async ({ data }) => {
    const session = await requireSession()
    const plannedDate = new Date(data.plannedDate)
    const dayEnd = new Date(plannedDate)
    dayEnd.setDate(dayEnd.getDate() + 1)

    const existing = await db.query.mealPlanEntries.findFirst({
      where: and(
        eq(mealPlanEntries.householdId, session.user.householdId),
        gte(mealPlanEntries.plannedDate, plannedDate),
        lt(mealPlanEntries.plannedDate, dayEnd),
        eq(mealPlanEntries.mealType, data.mealType),
      ),
    })

    if (existing) {
      await db
        .update(mealPlanEntries)
        .set({ recipeId: data.recipeId })
        .where(eq(mealPlanEntries.id, existing.id))
      return { id: existing.id }
    }

    const [entry] = await db
      .insert(mealPlanEntries)
      .values({
        householdId: session.user.householdId,
        recipeId: data.recipeId,
        plannedDate,
        mealType: data.mealType,
      })
      .returning()
    return { id: entry.id }
  })

export const clearMealPlanEntry = createServerFn({ method: "POST" })
  .inputValidator((id: number) => id)
  .handler(async ({ data }) => {
    const session = await requireSession()
    await db
      .delete(mealPlanEntries)
      .where(
        and(
          eq(mealPlanEntries.id, data),
          eq(mealPlanEntries.householdId, session.user.householdId),
        ),
      )
    return { id: data }
  })

export type MealPlanEntry = Awaited<ReturnType<typeof getMealPlan>>[number]
