import { createServerFn } from "@tanstack/react-start"
import { getRequest } from "@tanstack/react-start/server"
import { and, desc, eq, isNull, sql } from "drizzle-orm"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { collections, collectionRecipes, recipes } from "@/server/db/schema"

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

export const getCollections = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await requireSession()

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
      .where(eq(collections.householdId, session.user.householdId))
      .groupBy(collections.id)
      .orderBy(desc(collections.createdAt))
  },
)

export const getCollection = createServerFn({ method: "GET" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const session = await requireSession()

    const collection = await db.query.collections.findFirst({
      where: and(
        eq(collections.id, data.id),
        eq(collections.householdId, session.user.householdId),
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
  })

type CollectionInput = {
  name: string
  description?: string | null
}

export const createCollection = createServerFn({ method: "POST" })
  .inputValidator((data: CollectionInput) => data)
  .handler(async ({ data }) => {
    const session = await requireSession()
    const [collection] = await db
      .insert(collections)
      .values({
        householdId: session.user.householdId,
        createdById: session.user.id,
        name: data.name.trim(),
        description: data.description ?? null,
      })
      .returning()
    return collection
  })

export const updateCollection = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number } & CollectionInput) => data)
  .handler(async ({ data }) => {
    const session = await requireSession()
    const existing = await db.query.collections.findFirst({
      where: and(
        eq(collections.id, data.id),
        eq(collections.householdId, session.user.householdId),
      ),
    })
    if (!existing) throw new Error("Collection not found")
    await db
      .update(collections)
      .set({ name: data.name.trim(), description: data.description ?? null, updatedAt: new Date() })
      .where(eq(collections.id, data.id))
    return { id: data.id }
  })

export const deleteCollection = createServerFn({ method: "POST" })
  .inputValidator((id: number) => id)
  .handler(async ({ data }) => {
    const session = await requireSession()
    const existing = await db.query.collections.findFirst({
      where: and(
        eq(collections.id, data),
        eq(collections.householdId, session.user.householdId),
      ),
    })
    if (!existing) throw new Error("Collection not found")
    await db.delete(collections).where(eq(collections.id, data))
    return { id: data }
  })

export const addToCollection = createServerFn({ method: "POST" })
  .inputValidator((data: { collectionId: number; recipeId: number }) => data)
  .handler(async ({ data }) => {
    const session = await requireSession()
    // Verify both belong to this household
    const collection = await db.query.collections.findFirst({
      where: and(
        eq(collections.id, data.collectionId),
        eq(collections.householdId, session.user.householdId),
      ),
    })
    if (!collection) throw new Error("Collection not found")
    await db
      .insert(collectionRecipes)
      .values({ collectionId: data.collectionId, recipeId: data.recipeId })
      .onConflictDoNothing()
    return { success: true }
  })

export const removeFromCollection = createServerFn({ method: "POST" })
  .inputValidator((data: { collectionId: number; recipeId: number }) => data)
  .handler(async ({ data }) => {
    await requireSession()
    await db
      .delete(collectionRecipes)
      .where(
        and(
          eq(collectionRecipes.collectionId, data.collectionId),
          eq(collectionRecipes.recipeId, data.recipeId),
        ),
      )
    return { success: true }
  })

export type CollectionListItem = Awaited<ReturnType<typeof getCollections>>[number]
export type CollectionDetail = Awaited<ReturnType<typeof getCollection>>
