import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"
import { neonUser } from "./neon-auth-schema"

export { neonUser }

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  createdById: uuid("created_by_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  prepTime: integer("prep_time"),
  cookTime: integer("cook_time"),
  servings: integer("servings"),
  difficulty: varchar("difficulty", { length: 50 }),
  cuisine: varchar("cuisine", { length: 100 }),
  tags: text("tags").array(),
  isPublic: boolean("is_public").default(false).notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: varchar("quantity", { length: 100 }),
  unit: varchar("unit", { length: 50 }),
  notes: text("notes"),
  orderIndex: integer("order_index").default(0).notNull(),
})

export const steps = pgTable("steps", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  instruction: text("instruction").notNull(),
  imageUrl: text("image_url"),
  duration: integer("duration"),
})

export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  createdById: uuid("created_by_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const collectionRecipes = pgTable("collection_recipes", {
  id: serial("id").primaryKey(),
  collectionId: integer("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
})

export const mealPlanEntries = pgTable("meal_plan_entries", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  plannedDate: timestamp("planned_date").notNull(),
  mealType: varchar("meal_type", { length: 50 }),
  servings: integer("servings"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const cookLog = pgTable("cook_log", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  recipeId: integer("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  cookedById: uuid("cooked_by_id").notNull(),
  cookedAt: timestamp("cooked_at").defaultNow().notNull(),
  rating: integer("rating"),
  notes: text("notes"),
  servings: integer("servings"),
})

// Relations

export const householdsRelations = relations(households, ({ many }) => ({
  profiles: many(userProfiles),
  recipes: many(recipes),
  collections: many(collections),
  mealPlanEntries: many(mealPlanEntries),
  cookLog: many(cookLog),
}))

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  household: one(households, {
    fields: [userProfiles.householdId],
    references: [households.id],
  }),
  user: one(neonUser, {
    fields: [userProfiles.userId],
    references: [neonUser.id],
  }),
}))

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  household: one(households, {
    fields: [recipes.householdId],
    references: [households.id],
  }),
  createdBy: one(neonUser, {
    fields: [recipes.createdById],
    references: [neonUser.id],
  }),
  ingredients: many(ingredients),
  steps: many(steps),
  collectionRecipes: many(collectionRecipes),
  mealPlanEntries: many(mealPlanEntries),
  cookLog: many(cookLog),
}))

export const ingredientsRelations = relations(ingredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [ingredients.recipeId],
    references: [recipes.id],
  }),
}))

export const stepsRelations = relations(steps, ({ one }) => ({
  recipe: one(recipes, {
    fields: [steps.recipeId],
    references: [recipes.id],
  }),
}))

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  household: one(households, {
    fields: [collections.householdId],
    references: [households.id],
  }),
  createdBy: one(neonUser, {
    fields: [collections.createdById],
    references: [neonUser.id],
  }),
  collectionRecipes: many(collectionRecipes),
}))

export const collectionRecipesRelations = relations(
  collectionRecipes,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionRecipes.collectionId],
      references: [collections.id],
    }),
    recipe: one(recipes, {
      fields: [collectionRecipes.recipeId],
      references: [recipes.id],
    }),
  }),
)

export const mealPlanEntriesRelations = relations(
  mealPlanEntries,
  ({ one }) => ({
    household: one(households, {
      fields: [mealPlanEntries.householdId],
      references: [households.id],
    }),
    recipe: one(recipes, {
      fields: [mealPlanEntries.recipeId],
      references: [recipes.id],
    }),
  }),
)

export const cookLogRelations = relations(cookLog, ({ one }) => ({
  household: one(households, {
    fields: [cookLog.householdId],
    references: [households.id],
  }),
  recipe: one(recipes, {
    fields: [cookLog.recipeId],
    references: [recipes.id],
  }),
  cookedBy: one(neonUser, {
    fields: [cookLog.cookedById],
    references: [neonUser.id],
  }),
}))
