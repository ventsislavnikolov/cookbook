import { createServerFn } from "@tanstack/react-start"
import { and, desc, eq, isNull, sql } from "drizzle-orm"
import { db } from "@/server/db"
import { collections, collectionRecipes, recipes } from "@/server/db/schema"
import { withProfile } from "@/server/profile"

export const getCollections = createServerFn({ method: "GET" }).handler(() =>
  withProfile(async ({ householdId }) => {
    return db
      .select({
        id: collections.id,
        name: collections.name,
        description: collections.description,
        createdAt: collections.createdAt,
        recipeCount: sql<number>`count(${collectionRecipes.recipeId})::int`,
      })
      .from(collections)
      .leftJoin(
        collectionRecipes,
        eq(collections.id, collectionRecipes.collectionId),
      )
      .where(eq(collections.householdId, householdId))
      .groupBy(collections.id)
      .orderBy(desc(collections.createdAt))
  }),
)

export const getCollection = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => data)
  .handler(({ data }) =>
    withProfile(async ({ householdId }) => {
      const collection = await db.query.collections.findFirst({
        where: and(
          eq(collections.id, data.id),
          eq(collections.householdId, householdId),
        ),
      })
      if (!collection) throw new Error("Collection not found")

      const entries = await db
        .select({ recipe: recipes })
        .from(collectionRecipes)
        .innerJoin(recipes, eq(collectionRecipes.recipeId, recipes.id))
        .where(
          and(
            eq(collectionRecipes.collectionId, data.id),
            isNull(recipes.deletedAt),
          ),
        )

      return { ...collection, recipes: entries.map((e) => e.recipe) }
    }),
  )

type CollectionInput = {
  name: string
  description?: string | null
}

export const createCollection = createServerFn({ method: "POST" })
  .inputValidator((data: CollectionInput) => data)
  .handler(({ data }) =>
    withProfile(async ({ householdId, userId }) => {
      const [collection] = await db
        .insert(collections)
        .values({
          householdId,
          createdById: userId,
          name: data.name.trim(),
          description: data.description ?? null,
        })
        .returning()
      return collection
    }),
  )

export const updateCollection = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number } & CollectionInput) => data)
  .handler(({ data }) =>
    withProfile(async ({ householdId }) => {
      const existing = await db.query.collections.findFirst({
        where: and(
          eq(collections.id, data.id),
          eq(collections.householdId, householdId),
        ),
      })
      if (!existing) throw new Error("Collection not found")
      await db
        .update(collections)
        .set({ name: data.name.trim(), description: data.description ?? null, updatedAt: new Date() })
        .where(eq(collections.id, data.id))
      return { id: data.id }
    }),
  )

export const deleteCollection = createServerFn({ method: "POST" })
  .inputValidator((id: number) => id)
  .handler(({ data }) =>
    withProfile(async ({ householdId }) => {
      const existing = await db.query.collections.findFirst({
        where: and(
          eq(collections.id, data),
          eq(collections.householdId, householdId),
        ),
      })
      if (!existing) throw new Error("Collection not found")
      await db.delete(collections).where(eq(collections.id, data))
      return { id: data }
    }),
  )

export const addToCollection = createServerFn({ method: "POST" })
  .inputValidator((data: { collectionId: number; recipeId: number }) => data)
  .handler(({ data }) =>
    withProfile(async ({ householdId }) => {
      // Verify both belong to this household
      const collection = await db.query.collections.findFirst({
        where: and(
          eq(collections.id, data.collectionId),
          eq(collections.householdId, householdId),
        ),
      })
      if (!collection) throw new Error("Collection not found")
      await db
        .insert(collectionRecipes)
        .values({ collectionId: data.collectionId, recipeId: data.recipeId })
        .onConflictDoNothing()
      return { success: true }
    }),
  )

export const removeFromCollection = createServerFn({ method: "POST" })
  .inputValidator((data: { collectionId: number; recipeId: number }) => data)
  .handler(({ data }) =>
    withProfile(async () => {
      await db
        .delete(collectionRecipes)
        .where(
          and(
            eq(collectionRecipes.collectionId, data.collectionId),
            eq(collectionRecipes.recipeId, data.recipeId),
          ),
        )
      return { success: true }
    }),
  )

export type CollectionListItem = Awaited<ReturnType<typeof getCollections>>[number]
export type CollectionDetail = Awaited<ReturnType<typeof getCollection>>
