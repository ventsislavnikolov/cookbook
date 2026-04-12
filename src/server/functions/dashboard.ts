import { createServerFn } from "@tanstack/react-start"
import { and, count, desc, eq, gte, isNull, lt } from "drizzle-orm"
import { db } from "@/server/db"
import { cookLog, mealPlanEntries, recipes } from "@/server/db/schema"
import { requireAuth } from "@/lib/auth.server"

export const getDashboardStats = createServerFn({ method: "GET" }).handler(async () => {
  const { householdId: hid } = await requireAuth()

  const now = new Date()

  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const weekStart = new Date(now)
  const dayOfWeek = weekStart.getDay()
  const weekDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  weekStart.setDate(weekStart.getDate() + weekDiff)
  weekStart.setHours(0, 0, 0, 0)

  const [
    [totalResult],
    [favoriteResult],
    todaysPlan,
    recentCooks,
    weekCooks,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(recipes)
      .where(and(eq(recipes.householdId, hid), isNull(recipes.deletedAt))),
    db
      .select({ value: count() })
      .from(recipes)
      .where(
        and(
          eq(recipes.householdId, hid),
          eq(recipes.isFavorite, true),
          isNull(recipes.deletedAt),
        ),
      ),
    db
      .select({
        mealType: mealPlanEntries.mealType,
        recipeTitle: recipes.title,
        recipeId: mealPlanEntries.recipeId,
      })
      .from(mealPlanEntries)
      .innerJoin(recipes, eq(mealPlanEntries.recipeId, recipes.id))
      .where(
        and(
          eq(mealPlanEntries.householdId, hid),
          gte(mealPlanEntries.plannedDate, todayStart),
          lt(mealPlanEntries.plannedDate, todayEnd),
        ),
      ),
    db.query.cookLog.findMany({
      where: eq(cookLog.householdId, hid),
      orderBy: [desc(cookLog.cookedAt)],
      limit: 3,
      with: {
        recipe: { columns: { id: true, title: true } },
      },
    }),
    db.query.cookLog.findMany({
      where: and(eq(cookLog.householdId, hid), gte(cookLog.cookedAt, weekStart)),
      columns: { id: true },
    }),
  ])

  return {
    totalRecipes: totalResult.value,
    favoriteRecipes: favoriteResult.value,
    todaysPlan,
    recentCooks,
    weekCookCount: weekCooks.length,
  }
})

export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>
