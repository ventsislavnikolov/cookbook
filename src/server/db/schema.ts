import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

export const households = pgTable("households", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  householdId: integer("household_id")
    .notNull()
    .references(() => households.id, { onDelete: "cascade" }),
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id),
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
  createdById: text("created_by_id")
    .notNull()
    .references(() => users.id),
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
  cookedById: text("cooked_by_id")
    .notNull()
    .references(() => users.id),
  cookedAt: timestamp("cooked_at").defaultNow().notNull(),
  rating: integer("rating"),
  notes: text("notes"),
  servings: integer("servings"),
})

// Relations

export const householdsRelations = relations(households, ({ many }) => ({
  users: many(users),
  recipes: many(recipes),
  collections: many(collections),
  mealPlanEntries: many(mealPlanEntries),
  cookLog: many(cookLog),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  household: one(households, {
    fields: [users.householdId],
    references: [households.id],
  }),
  sessions: many(sessions),
  accounts: many(accounts),
  recipes: many(recipes),
  collections: many(collections),
  cookLog: many(cookLog),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}))

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  household: one(households, {
    fields: [recipes.householdId],
    references: [households.id],
  }),
  createdBy: one(users, {
    fields: [recipes.createdById],
    references: [users.id],
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
  createdBy: one(users, {
    fields: [collections.createdById],
    references: [users.id],
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
  cookedBy: one(users, {
    fields: [cookLog.cookedById],
    references: [users.id],
  }),
}))
