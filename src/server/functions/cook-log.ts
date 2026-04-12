import { createServerFn } from "@tanstack/react-start"
import { and, desc, eq, gte } from "drizzle-orm"
import { db } from "@/server/db"
import { cookLog, recipes } from "@/server/db/schema"
import { requireAuth } from "@/lib/auth.functions"

type LogCookInput = {
  recipeId: number
  rating?: number | null
  notes?: string | null
  servings?: number | null
  cookedAt?: string | null
}

export const logCook = createServerFn({ method: "POST" })
  .inputValidator((data: LogCookInput) => data)
  .handler(async ({ data }: { data: LogCookInput }) => {
    const { householdId, userId } = await requireAuth()

    // Verify recipe belongs to household
    const recipe = await db.query.recipes.findFirst({
      where: and(
        eq(recipes.id, data.recipeId),
        eq(recipes.householdId, householdId),
      ),
    })
    if (!recipe) throw new Error("Recipe not found")

    const [entry] = await db
      .insert(cookLog)
      .values({
        householdId,
        recipeId: data.recipeId,
        cookedById: userId,
        cookedAt: data.cookedAt ? new Date(data.cookedAt) : new Date(),
        rating: data.rating ?? null,
        notes: data.notes ?? null,
        servings: data.servings ?? null,
      })
      .returning()

    return entry
  })

export const getCookLog = createServerFn({ method: "GET" }).handler(
  async () => {
    const { householdId } = await requireAuth()
    return db.query.cookLog.findMany({
      where: eq(cookLog.householdId, householdId),
      orderBy: [desc(cookLog.cookedAt)],
      with: {
        recipe: { columns: { id: true, title: true } },
        cookedBy: { columns: { id: true, name: true } },
      },
    })
  },
)

export const getCookingStreak = createServerFn({ method: "GET" }).handler(
  async () => {
    const { householdId } = await requireAuth()

    const entries = await db.query.cookLog.findMany({
      where: eq(cookLog.householdId, householdId),
      orderBy: [desc(cookLog.cookedAt)],
      columns: { cookedAt: true },
    })

    if (entries.length === 0) return { streak: 0 }

    // Collect distinct calendar dates (UTC)
    const dates = [
      ...new Set(
        entries.map((e) => e.cookedAt.toISOString().slice(0, 10)),
      ),
    ].sort((a, b) => b.localeCompare(a)) // DESC

    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

    // Streak must start today or yesterday
    if (dates[0] !== today && dates[0] !== yesterday) return { streak: 0 }

    let streak = 1
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diffDays = Math.round(
        (prev.getTime() - curr.getTime()) / 86400000,
      )
      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }

    return { streak }
  },
)

const WEEKLY_TARGET = 5

export const getWeeklyGoals = createServerFn({ method: "GET" }).handler(
  async () => {
    const { householdId } = await requireAuth()

    const now = new Date()
    // Monday of this week
    const startOfWeek = new Date(now)
    const day = startOfWeek.getDay()
    const diff = day === 0 ? -6 : 1 - day
    startOfWeek.setDate(startOfWeek.getDate() + diff)
    startOfWeek.setHours(0, 0, 0, 0)

    const entries = await db.query.cookLog.findMany({
      where: and(
        eq(cookLog.householdId, householdId),
        gte(cookLog.cookedAt, startOfWeek),
      ),
      columns: { id: true },
    })

    const cookedCount = entries.length
    return {
      cookedCount,
      target: WEEKLY_TARGET,
      percentage: Math.min(
        Math.round((cookedCount / WEEKLY_TARGET) * 100),
        100,
      ),
    }
  },
)

export type CookLogEntry = Awaited<ReturnType<typeof getCookLog>>[number]
