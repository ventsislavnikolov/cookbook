import { createServerFn } from "@tanstack/react-start"
import { and, desc, eq, ilike, isNull, isNotNull } from "drizzle-orm"
import { db } from "@/server/db"
import { ingredients, recipes, steps } from "@/server/db/schema"
import { requireAuth } from "@/lib/auth.functions"

type IngredientInput = {
  name: string
  quantity: string | null
  unit: string | null
  notes: string | null
}

type StepInput = {
  instruction: string
  duration: number | null
}

type RecipeInput = {
  title: string
  description: string | null
  prepTime: number | null
  cookTime: number | null
  servings: number | null
  difficulty: string | null
  cuisine: string | null
  tags: string[] | null
  ingredients: IngredientInput[]
  steps: StepInput[]
}

function validateRecipeInput(data: unknown): RecipeInput {
  if (!data || typeof data !== "object") throw new Error("Invalid input")
  const d = data as Record<string, unknown>
  if (typeof d.title !== "string" || d.title.trim().length === 0) {
    throw new Error("Title is required")
  }
  const ings = Array.isArray(d.ingredients) ? d.ingredients : []
  const stps = Array.isArray(d.steps) ? d.steps : []
  return {
    title: d.title.trim(),
    description: (d.description as string | null) ?? null,
    prepTime: (d.prepTime as number | null) ?? null,
    cookTime: (d.cookTime as number | null) ?? null,
    servings: (d.servings as number | null) ?? null,
    difficulty: (d.difficulty as string | null) ?? null,
    cuisine: (d.cuisine as string | null) ?? null,
    tags: (d.tags as string[] | null) ?? null,
    ingredients: ings
      .filter(
        (i: unknown): i is Record<string, unknown> =>
          !!i && typeof i === "object",
      )
      .map((i) => ({
        name: String(i.name ?? "").trim(),
        quantity: (i.quantity as string | null) ?? null,
        unit: (i.unit as string | null) ?? null,
        notes: (i.notes as string | null) ?? null,
      }))
      .filter((i) => i.name.length > 0),
    steps: stps
      .filter(
        (s: unknown): s is Record<string, unknown> =>
          !!s && typeof s === "object",
      )
      .map((s) => ({
        instruction: String(s.instruction ?? "").trim(),
        duration: (s.duration as number | null) ?? null,
      }))
      .filter((s) => s.instruction.length > 0),
  }
}

type RecipeFilters = {
  search?: string
  cuisine?: string
  difficulty?: string
  favoritesOnly?: boolean
  includeDeleted?: boolean
  deletedOnly?: boolean
}

export const listRecipes = createServerFn({ method: "GET" })
  .inputValidator((data: RecipeFilters) => data)
  .handler(async ({ data }: { data: RecipeFilters }) => {
    const { householdId } = await requireAuth()

    const conditions = [eq(recipes.householdId, householdId)]

    if (data.deletedOnly) {
      conditions.push(isNotNull(recipes.deletedAt))
    } else if (!data.includeDeleted) {
      conditions.push(isNull(recipes.deletedAt))
    }
    if (data.search) {
      conditions.push(ilike(recipes.title, `%${data.search}%`))
    }
    if (data.cuisine) {
      conditions.push(eq(recipes.cuisine, data.cuisine))
    }
    if (data.difficulty) {
      conditions.push(eq(recipes.difficulty, data.difficulty))
    }
    if (data.favoritesOnly) {
      conditions.push(eq(recipes.isFavorite, true))
    }

    return db.query.recipes.findMany({
      where: and(...conditions),
      orderBy: [desc(recipes.updatedAt)],
    })
  })

export const getRecipe = createServerFn({ method: "GET" })
  .inputValidator((id: number) => id)
  .handler(async ({ data }: { data: number }) => {
    const { householdId } = await requireAuth()
    const recipe = await db.query.recipes.findFirst({
      where: and(
        eq(recipes.id, data),
        eq(recipes.householdId, householdId),
        isNull(recipes.deletedAt),
      ),
      with: {
        ingredients: true,
        steps: true,
        createdBy: { columns: { id: true, name: true, email: true } },
      },
    })
    if (!recipe) throw new Error("Recipe not found")
    return {
      ...recipe,
      ingredients: [...recipe.ingredients].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      ),
      steps: [...recipe.steps].sort((a, b) => a.stepNumber - b.stepNumber),
    }
  })

export const createRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => validateRecipeInput(data))
  .handler(async ({ data }: { data: RecipeInput }) => {
    const { householdId, userId } = await requireAuth()
    const [recipe] = await db
      .insert(recipes)
      .values({
        householdId,
        createdById: userId,
        title: data.title,
        description: data.description,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        difficulty: data.difficulty,
        cuisine: data.cuisine,
        tags: data.tags,
      })
      .returning()

    if (data.ingredients.length > 0) {
      await db.insert(ingredients).values(
        data.ingredients.map((i: IngredientInput, idx: number) => ({
          recipeId: recipe.id,
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          notes: i.notes,
          orderIndex: idx,
        })),
      )
    }

    if (data.steps.length > 0) {
      await db.insert(steps).values(
        data.steps.map((s: StepInput, idx: number) => ({
          recipeId: recipe.id,
          stepNumber: idx + 1,
          instruction: s.instruction,
          duration: s.duration,
        })),
      )
    }

    return recipe
  })

export const updateRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = data as { id: unknown } & Record<string, unknown>
    if (typeof d.id !== "number") throw new Error("Invalid id")
    return { id: d.id, input: validateRecipeInput(data) }
  })
  .handler(
    async ({ data }: { data: { id: number; input: RecipeInput } }) => {
      const { householdId } = await requireAuth()
      const { id, input } = data
      const existing = await db.query.recipes.findFirst({
        where: and(
          eq(recipes.id, id),
          eq(recipes.householdId, householdId),
          isNull(recipes.deletedAt),
        ),
      })
      if (!existing) throw new Error("Recipe not found")

      await db
        .update(recipes)
        .set({
          title: input.title,
          description: input.description,
          prepTime: input.prepTime,
          cookTime: input.cookTime,
          servings: input.servings,
          difficulty: input.difficulty,
          cuisine: input.cuisine,
          tags: input.tags,
          updatedAt: new Date(),
        })
        .where(eq(recipes.id, id))

      await db.delete(ingredients).where(eq(ingredients.recipeId, id))
      await db.delete(steps).where(eq(steps.recipeId, id))

      if (input.ingredients.length > 0) {
        await db.insert(ingredients).values(
          input.ingredients.map((i: IngredientInput, idx: number) => ({
            recipeId: id,
            name: i.name,
            quantity: i.quantity,
            unit: i.unit,
            notes: i.notes,
            orderIndex: idx,
          })),
        )
      }
      if (input.steps.length > 0) {
        await db.insert(steps).values(
          input.steps.map((s: StepInput, idx: number) => ({
            recipeId: id,
            stepNumber: idx + 1,
            instruction: s.instruction,
            duration: s.duration,
          })),
        )
      }

      return { id }
    },
  )

export const deleteRecipe = createServerFn({ method: "POST" })
  .inputValidator((id: number) => id)
  .handler(async ({ data }: { data: number }) => {
    const { householdId } = await requireAuth()
    const existing = await db.query.recipes.findFirst({
      where: and(
        eq(recipes.id, data),
        eq(recipes.householdId, householdId),
        isNull(recipes.deletedAt),
      ),
    })
    if (!existing) throw new Error("Recipe not found")
    await db
      .update(recipes)
      .set({ deletedAt: new Date() })
      .where(eq(recipes.id, data))
    return { id: data }
  })

export const restoreRecipe = createServerFn({ method: "POST" })
  .inputValidator((id: number) => id)
  .handler(async ({ data }: { data: number }) => {
    const { householdId } = await requireAuth()
    const existing = await db.query.recipes.findFirst({
      where: and(
        eq(recipes.id, data),
        eq(recipes.householdId, householdId),
        isNotNull(recipes.deletedAt),
      ),
    })
    if (!existing) throw new Error("Recipe not found")
    await db
      .update(recipes)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(recipes.id, data))
    return { id: data }
  })

export const purgeRecipe = createServerFn({ method: "POST" })
  .inputValidator((id: number) => id)
  .handler(async ({ data }: { data: number }) => {
    const { householdId } = await requireAuth()
    const existing = await db.query.recipes.findFirst({
      where: and(
        eq(recipes.id, data),
        eq(recipes.householdId, householdId),
      ),
    })
    if (!existing) throw new Error("Recipe not found")
    await db.delete(recipes).where(eq(recipes.id, data))
    return { id: data }
  })

export const toggleFavorite = createServerFn({ method: "POST" })
  .inputValidator((id: number) => id)
  .handler(async ({ data }: { data: number }) => {
    const { householdId } = await requireAuth()
    const recipe = await db.query.recipes.findFirst({
      where: and(
        eq(recipes.id, data),
        eq(recipes.householdId, householdId),
        isNull(recipes.deletedAt),
      ),
    })
    if (!recipe) throw new Error("Recipe not found")
    await db
      .update(recipes)
      .set({ isFavorite: !recipe.isFavorite, updatedAt: new Date() })
      .where(eq(recipes.id, data))
    return { id: data, isFavorite: !recipe.isFavorite }
  })

export type RecipeListItem = Awaited<ReturnType<typeof listRecipes>>[number]
export type RecipeDetail = Awaited<ReturnType<typeof getRecipe>>
