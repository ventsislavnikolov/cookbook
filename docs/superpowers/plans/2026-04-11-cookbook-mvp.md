# Cookbook MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack recipe collection and meal planning app with auth, recipe/collection/meal-plan CRUD, dashboard with 7 widgets, pixel-faithful to the Square UI Cookbook reference with light and dark mode.

**Architecture:** TanStack Start SSR app with file-based routing, Drizzle ORM over Neon Postgres, Better Auth for email/password authentication, shadcn/ui component library with HSL-based theming. All data scoped by `household_id`. Server functions (RPC-style) handle all data mutations.

**Tech Stack:** TanStack Start, TanStack Router, TanStack Query, React 19, Tailwind CSS 4, shadcn/ui, Recharts, Drizzle ORM, Neon Postgres, Better Auth, Vercel

**Reference design:** [Square UI Cookbook](https://square-ui-cookbook.vercel.app/)

**Design spec:** `docs/superpowers/specs/2026-04-11-cookbook-mvp-design.md`

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/router.tsx`
- Create: `src/routes/__root.tsx`
- Create: `src/styles/app.css`
- Create: `.env`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Initialize project**

```bash
mkdir -p src/routes src/styles src/components/ui src/server/db src/server/functions src/lib/hooks
pnpm init
```

- [ ] **Step 2: Install core dependencies**

```bash
pnpm add @tanstack/react-start @tanstack/react-router @tanstack/react-query react react-dom
pnpm add -D vite @vitejs/plugin-react typescript @types/react @types/react-dom @types/node
```

- [ ] **Step 3: Install Tailwind + shadcn deps**

```bash
pnpm add tailwindcss @tailwindcss/vite
pnpm add class-variance-authority clsx tailwind-merge lucide-react
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "module": "ESNext",
    "target": "ES2022",
    "skipLibCheck": true,
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create vite.config.ts**

```typescript
import path from "path"
import { defineConfig } from "vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [tanstackStart(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

- [ ] **Step 6: Create package.json scripts**

Add to `package.json`:

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:seed": "tsx src/server/db/seed.ts"
  }
}
```

- [ ] **Step 7: Create src/styles/app.css**

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 0 72% 51%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 0 72% 51%;
    --radius: 0.5rem;
    --sidebar: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 0 72% 51%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 0 72% 51%;
    --chart-1: 0 72% 51%;
    --chart-2: 142 71% 45%;
    --chart-3: 217 91% 60%;
    --chart-4: 47 96% 53%;
    --chart-5: 270 67% 47%;
  }

  .dark {
    --background: 240 20% 10%;
    --foreground: 0 0% 91%;
    --card: 240 17% 14%;
    --card-foreground: 0 0% 91%;
    --popover: 240 17% 14%;
    --popover-foreground: 0 0% 91%;
    --primary: 0 72% 51%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 12% 20%;
    --secondary-foreground: 0 0% 91%;
    --muted: 240 12% 20%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 12% 20%;
    --accent-foreground: 0 0% 91%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 12% 20%;
    --input: 240 12% 20%;
    --ring: 0 72% 51%;
    --sidebar: 240 20% 8%;
    --sidebar-foreground: 0 0% 91%;
    --sidebar-primary: 0 72% 51%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 12% 16%;
    --sidebar-accent-foreground: 0 0% 91%;
    --sidebar-border: 240 12% 20%;
    --sidebar-ring: 0 72% 51%;
    --chart-1: 0 72% 55%;
    --chart-2: 142 71% 50%;
    --chart-3: 217 91% 65%;
    --chart-4: 47 96% 58%;
    --chart-5: 270 67% 55%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 8: Create src/lib/utils.ts**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 9: Create src/router.tsx**

```typescript
import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  })
  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
```

- [ ] **Step 10: Create src/routes/__root.tsx**

```typescript
/// <reference types="vite/client" />
import type { ReactNode } from "react"
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cookbook" },
    ],
    links: [
      { rel: "stylesheet", href: "/src/styles/app.css" },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
```

- [ ] **Step 11: Create .env.example and .gitignore**

`.env.example`:
```
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
```

`.gitignore`:
```
node_modules
dist
.env
.vinxi
.output
.superpowers
src/routeTree.gen.ts
```

- [ ] **Step 12: Create a test index route and verify dev server starts**

Create `src/routes/index.tsx`:

```typescript
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  return <div className="p-4">Cookbook</div>
}
```

Run: `pnpm dev`
Expected: Dev server starts on port 3000, page shows "Cookbook"

- [ ] **Step 13: Initialize shadcn/ui**

```bash
pnpm dlx shadcn@latest init
```

Follow prompts: select "Default" style, CSS variables = yes, base color = Neutral, path alias = `@/components`.

- [ ] **Step 14: Add core shadcn components**

```bash
pnpm dlx shadcn@latest add button card input textarea select badge avatar dialog alert-dialog dropdown-menu separator progress table sonner sidebar chart
```

- [ ] **Step 15: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold TanStack Start project with Tailwind + shadcn"
```

---

## Task 2: Database Schema + Connection

**Files:**
- Create: `src/server/db/index.ts`
- Create: `src/server/db/schema.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Install Drizzle + Neon dependencies**

```bash
pnpm add drizzle-orm @neondatabase/serverless
pnpm add -D drizzle-kit tsx
```

- [ ] **Step 2: Create drizzle.config.ts**

```typescript
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./drizzle",
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

- [ ] **Step 3: Create src/server/db/index.ts**

```typescript
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle({ client: sql, schema })
```

- [ ] **Step 4: Create src/server/db/schema.ts**

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  decimal,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const roleEnum = pgEnum("role", ["owner", "member"])
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"])
export const categoryEnum = pgEnum("category", [
  "main",
  "appetizer",
  "side",
  "dessert",
  "drink",
  "snack",
])
export const mealSlotEnum = pgEnum("meal_slot", [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
])

// Tables
export const households = pgTable("households", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  avatarUrl: text("avatar_url"),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id),
  role: roleEnum("role").notNull().default("owner"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const recipes = pgTable("recipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  emoji: varchar("emoji", { length: 10 }).notNull().default("🍽️"),
  imageUrl: text("image_url"),
  prepTimeMin: integer("prep_time_min"),
  cookTimeMin: integer("cook_time_min"),
  servings: integer("servings").notNull().default(4),
  difficulty: difficultyEnum("difficulty").notNull().default("easy"),
  category: categoryEnum("category").notNull().default("main"),
  cuisine: varchar("cuisine", { length: 50 }).notNull().default(""),
  calories: integer("calories"),
  proteinPct: integer("protein_pct"),
  carbsPct: integer("carbs_pct"),
  fatPct: integer("fat_pct"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  deletedAt: timestamp("deleted_at"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const ingredients = pgTable("ingredients", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  amount: decimal("amount"),
  unit: varchar("unit", { length: 30 }),
  sortOrder: integer("sort_order").notNull().default(0),
})

export const steps = pgTable("steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  instruction: text("instruction").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
})

export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id),
  name: varchar("name", { length: 100 }).notNull(),
  emoji: varchar("emoji", { length: 10 }),
  color: varchar("color", { length: 7 }).notNull().default("#e74c3c"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const collectionRecipes = pgTable(
  "collection_recipes",
  {
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    recipeId: uuid("recipe_id")
      .notNull()
      .references(() => recipes.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.collectionId, table.recipeId] })],
)

export const mealPlanEntries = pgTable("meal_plan_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  householdId: uuid("household_id")
    .notNull()
    .references(() => households.id),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id),
  date: date("date").notNull(),
  slot: mealSlotEnum("slot").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
})

export const cookLog = pgTable("cook_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id),
  cookedBy: uuid("cooked_by")
    .notNull()
    .references(() => users.id),
  cookedAt: timestamp("cooked_at").defaultNow().notNull(),
  notes: text("notes"),
})

// Relations
export const householdsRelations = relations(households, ({ many }) => ({
  users: many(users),
  recipes: many(recipes),
  collections: many(collections),
  mealPlanEntries: many(mealPlanEntries),
}))

export const usersRelations = relations(users, ({ one }) => ({
  household: one(households, {
    fields: [users.householdId],
    references: [households.id],
  }),
}))

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  household: one(households, {
    fields: [recipes.householdId],
    references: [households.id],
  }),
  createdByUser: one(users, {
    fields: [recipes.createdBy],
    references: [users.id],
  }),
  ingredients: many(ingredients),
  steps: many(steps),
  collectionRecipes: many(collectionRecipes),
  cookLogs: many(cookLog),
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
  createdByUser: one(users, {
    fields: [collections.createdBy],
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
    createdByUser: one(users, {
      fields: [mealPlanEntries.createdBy],
      references: [users.id],
    }),
  }),
)

export const cookLogRelations = relations(cookLog, ({ one }) => ({
  recipe: one(recipes, {
    fields: [cookLog.recipeId],
    references: [recipes.id],
  }),
  cookedByUser: one(users, {
    fields: [cookLog.cookedBy],
    references: [users.id],
  }),
}))
```

- [ ] **Step 5: Set up .env with your Neon DATABASE_URL**

Get your connection string from the Neon console and add it to `.env`:

```
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/cookbook?sslmode=require
BETTER_AUTH_SECRET=<run: openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
```

- [ ] **Step 6: Push schema to Neon**

Run: `pnpm db:push`
Expected: All tables created successfully in Neon

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(db): add Drizzle schema with all tables and relations"
```

---

## Task 3: Auth Setup

**Files:**
- Create: `src/server/auth.ts`
- Create: `src/lib/auth-client.ts`
- Create: `src/lib/auth.functions.ts`
- Create: `src/routes/api/auth/$.ts`

- [ ] **Step 1: Install Better Auth**

```bash
pnpm add better-auth
```

- [ ] **Step 2: Create src/server/auth.ts**

```typescript
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { db } from "./db"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
})
```

- [ ] **Step 3: Generate Better Auth tables**

Run: `npx @better-auth/cli generate`

This creates Better Auth's internal tables (session, account, verification). Then push:

Run: `pnpm db:push`

- [ ] **Step 4: Create src/routes/api/auth/$.ts**

```typescript
import { createAPIFileRoute } from "@tanstack/react-start/api"
import { auth } from "@/server/auth"

export const APIRoute = createAPIFileRoute("/api/auth/$")({
  GET: ({ request }) => {
    return auth.handler(request)
  },
  POST: ({ request }) => {
    return auth.handler(request)
  },
})
```

- [ ] **Step 5: Create src/lib/auth-client.ts**

```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "http://localhost:3000",
})

export const { signIn, signUp, signOut, useSession } = authClient
```

- [ ] **Step 6: Create src/lib/auth.functions.ts**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "@/server/auth"
import { db } from "@/server/db"
import { users, households } from "@/server/db/schema"
import { eq } from "drizzle-orm"

export const getSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    return session
  },
)

export const ensureSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) throw new Error("Unauthorized")

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    })
    if (!user) throw new Error("User not found")

    return { session, user, householdId: user.householdId }
  },
)
```

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(auth): configure Better Auth with Drizzle + TanStack Start"
```

---

## Task 4: Auth Pages (Login + Signup)

**Files:**
- Create: `src/routes/login.tsx`
- Create: `src/routes/signup.tsx`

- [ ] **Step 1: Create src/routes/login.tsx**

```typescript
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { signIn } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/login")({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn.email({
      email,
      password,
    })

    if (result.error) {
      setError(result.error.message ?? "Login failed")
      setLoading(false)
      return
    }

    navigate({ to: "/" })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl text-primary-foreground">
            🍳
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to your Cookbook account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="chef@cookbook.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Create src/routes/signup.tsx**

```typescript
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { signUp } from "@/lib/auth-client"
import { createServerFn } from "@tanstack/react-start"
import { db } from "@/server/db"
import { households, users } from "@/server/db/schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const createHouseholdForUser = createServerFn({ method: "POST" })
  .inputValidator((data: { userId: string; userName: string }) => data)
  .handler(async ({ data }) => {
    const [household] = await db
      .insert(households)
      .values({ name: `${data.userName}'s Kitchen` })
      .returning()

    await db
      .insert(users)
      .values({
        id: data.userId,
        email: "",
        name: data.userName,
        householdId: household.id,
        role: "owner",
      })

    return household
  })

export const Route = createFileRoute("/signup")({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signUp.email({
      email,
      password,
      name,
    })

    if (result.error) {
      setError(result.error.message ?? "Signup failed")
      setLoading(false)
      return
    }

    if (result.data?.user) {
      await createHouseholdForUser({
        data: {
          userId: result.data.user.id,
          userName: name,
        },
      })
    }

    navigate({ to: "/" })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl text-primary-foreground">
            🍳
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Start building your recipe collection
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Chef"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="chef@cookbook.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Verify auth flow works**

Run: `pnpm dev`
1. Navigate to `/signup`, create an account
2. Navigate to `/login`, sign in
Expected: Both forms work, session cookie is set

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(auth): add login and signup pages"
```

---

## Task 5: App Shell (Root Layout + Auth Guard)

**Files:**
- Create: `src/routes/_authed.tsx`
- Create: `src/components/sidebar/app-sidebar.tsx`
- Create: `src/components/sidebar/nav-section.tsx`
- Create: `src/components/header.tsx`
- Modify: `src/routes/__root.tsx` (add theme script)

- [ ] **Step 1: Create src/routes/_authed.tsx**

This is the auth-guarded layout that wraps all authenticated pages:

```typescript
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router"
import { getSession } from "@/lib/auth.functions"
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { AppHeader } from "@/components/header"

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const session = await getSession()
    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }
    return { user: session.user }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  const { user } = Route.useRouteContext()

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
```

- [ ] **Step 2: Create src/components/sidebar/nav-section.tsx**

```typescript
import { Link, useMatchRoute } from "@tanstack/react-router"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  icon: string
  to: string
}

interface NavSectionProps {
  label: string
  items: NavItem[]
}

export function NavSection({ label, items }: NavSectionProps) {
  const matchRoute = useMatchRoute()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = matchRoute({ to: item.to, fuzzy: true })
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton asChild isActive={!!isActive}>
                  <Link to={item.to}>
                    <span>{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
```

- [ ] **Step 3: Create src/components/sidebar/app-sidebar.tsx**

```typescript
import { Link } from "@tanstack/react-router"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { NavSection } from "./nav-section"

const workspaceItems = [
  { title: "Dashboard", icon: "📊", to: "/" },
  { title: "Recipes", icon: "🍽️", to: "/recipes" },
  { title: "Collections", icon: "📁", to: "/collections" },
  { title: "Meal Plan", icon: "📅", to: "/meal-plan" },
]

const libraryItems = [
  { title: "Favorites", icon: "❤️", to: "/favorites" },
  { title: "Recent", icon: "🕐", to: "/recent" },
  { title: "Trash", icon: "🗑️", to: "/trash" },
]

interface AppSidebarProps {
  user: { id: string; name: string; email: string }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-lg text-primary-foreground">
            🍳
          </div>
          <div>
            <p className="text-sm font-semibold">Cookbook</p>
            <p className="text-xs text-muted-foreground">Square UI</p>
          </div>
        </div>
        <div className="px-2 pt-2">
          <Button asChild className="w-full" size="sm">
            <Link to="/recipes/new">+ New Recipe</Link>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavSection label="Workspace" items={workspaceItems} />
        <NavSection label="Library" items={libraryItems} />

        {/* Collections section - populated dynamically in Task 13 */}
        <SidebarGroup>
          <SidebarGroupLabel>Collections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="text-muted-foreground text-xs">
                  No collections yet
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {/* Cooking streak - populated in Task 15 */}
        <div className="flex items-center gap-2 px-2 py-1 text-sm">
          <span>🔥</span>
          <div>
            <p className="text-xs font-semibold">Cooking Streak</p>
            <p className="text-xs text-muted-foreground">0 days</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2 py-1">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate">
            <p className="text-xs font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
```

- [ ] **Step 4: Create src/components/header.tsx**

```typescript
import { useNavigate, useLocation } from "@tanstack/react-router"
import { useState, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "@tanstack/react-router"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/recipes": "Recipes",
  "/recipes/new": "New Recipe",
  "/collections": "Collections",
  "/meal-plan": "Meal Plan",
  "/favorites": "Favorites",
  "/recent": "Recent",
  "/trash": "Trash",
  "/settings": "Settings",
}

export function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = saved === "dark" || (!saved && prefersDark)
    setDarkMode(isDark)
    document.documentElement.classList.toggle("dark", isDark)
  }, [])

  function toggleDarkMode() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      navigate({ to: "/recipes", search: { search: search.trim() } })
    }
  }

  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/recipes/") ? "Recipe" : "")

  return (
    <header className="flex h-14 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <span className="text-sm font-medium">{title}</span>

      <div className="ml-auto flex items-center gap-2">
        <form onSubmit={handleSearch}>
          <Input
            placeholder="Search recipes..."
            className="h-8 w-48 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </Button>
        <Button asChild size="sm">
          <Link to="/recipes/new">+ Add Recipe</Link>
        </Button>
      </div>
    </header>
  )
}
```

- [ ] **Step 5: Move dashboard route under _authed**

Move `src/routes/index.tsx` to `src/routes/_authed/index.tsx`:

```typescript
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authed/")({
  component: Dashboard,
})

function Dashboard() {
  const { user } = Route.useRouteContext()

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {greeting}, {user.name}
      </h1>
      <p className="text-muted-foreground">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  )
}
```

- [ ] **Step 6: Verify the app shell**

Run: `pnpm dev`
1. Navigate to `/` — should redirect to `/login` if not authenticated
2. Log in — should show sidebar + header + "Good evening, Chef" greeting
3. Toggle dark mode — should switch theme
Expected: Full app shell with sidebar navigation, header with search + dark mode toggle

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(shell): add auth-guarded layout with sidebar and header"
```

---

## Task 6: Recipe Server Functions

**Files:**
- Create: `src/server/functions/recipes.ts`

- [ ] **Step 1: Create src/server/functions/recipes.ts**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { db } from "@/server/db"
import {
  recipes,
  ingredients,
  steps,
} from "@/server/db/schema"
import { eq, and, isNull, ilike, desc, sql } from "drizzle-orm"
import { ensureSession } from "@/lib/auth.functions"

export const getRecipes = createServerFn({ method: "GET" })
  .inputValidator(
    (data: {
      search?: string
      category?: string
      cuisine?: string
      difficulty?: string
      favoritesOnly?: boolean
    }) => data,
  )
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()

    const conditions = [
      eq(recipes.householdId, householdId),
      isNull(recipes.deletedAt),
    ]

    if (data.search) {
      conditions.push(ilike(recipes.title, `%${data.search}%`))
    }
    if (data.category) {
      conditions.push(eq(recipes.category, data.category as any))
    }
    if (data.cuisine) {
      conditions.push(eq(recipes.cuisine, data.cuisine))
    }
    if (data.difficulty) {
      conditions.push(eq(recipes.difficulty, data.difficulty as any))
    }
    if (data.favoritesOnly) {
      conditions.push(eq(recipes.isFavorite, true))
    }

    return db
      .select()
      .from(recipes)
      .where(and(...conditions))
      .orderBy(desc(recipes.updatedAt))
  })

export const getRecipe = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()

    const recipe = await db.query.recipes.findFirst({
      where: and(
        eq(recipes.id, data.id),
        eq(recipes.householdId, householdId),
      ),
      with: {
        ingredients: { orderBy: [ingredients.sortOrder] },
        steps: { orderBy: [steps.sortOrder] },
      },
    })

    if (!recipe) throw new Error("Recipe not found")
    return recipe
  })

export const createRecipe = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      title: string
      description?: string
      emoji?: string
      prepTimeMin?: number
      cookTimeMin?: number
      servings?: number
      difficulty: string
      category: string
      cuisine: string
      calories?: number
      proteinPct?: number
      carbsPct?: number
      fatPct?: number
      ingredients: { name: string; amount?: string; unit?: string }[]
      steps: { instruction: string }[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const { householdId, user } = await ensureSession()
    const { ingredients: ingredientData, steps: stepData, ...recipeData } = data

    const [recipe] = await db
      .insert(recipes)
      .values({
        ...recipeData,
        difficulty: recipeData.difficulty as any,
        category: recipeData.category as any,
        emoji: recipeData.emoji || "🍽️",
        householdId,
        createdBy: user.householdId ? user.id : user.id,
      })
      .returning()

    if (ingredientData.length > 0) {
      await db.insert(ingredients).values(
        ingredientData.map((ing, i) => ({
          recipeId: recipe.id,
          name: ing.name,
          amount: ing.amount ?? null,
          unit: ing.unit ?? null,
          sortOrder: i,
        })),
      )
    }

    if (stepData.length > 0) {
      await db.insert(steps).values(
        stepData.map((step, i) => ({
          recipeId: recipe.id,
          instruction: step.instruction,
          sortOrder: i,
        })),
      )
    }

    return recipe
  })

export const updateRecipe = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      id: string
      title: string
      description?: string
      emoji?: string
      prepTimeMin?: number
      cookTimeMin?: number
      servings?: number
      difficulty: string
      category: string
      cuisine: string
      calories?: number
      proteinPct?: number
      carbsPct?: number
      fatPct?: number
      ingredients: { name: string; amount?: string; unit?: string }[]
      steps: { instruction: string }[]
    }) => data,
  )
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()
    const {
      id,
      ingredients: ingredientData,
      steps: stepData,
      ...recipeData
    } = data

    await db
      .update(recipes)
      .set({
        ...recipeData,
        difficulty: recipeData.difficulty as any,
        category: recipeData.category as any,
        updatedAt: new Date(),
      })
      .where(and(eq(recipes.id, id), eq(recipes.householdId, householdId)))

    await db.delete(ingredients).where(eq(ingredients.recipeId, id))
    if (ingredientData.length > 0) {
      await db.insert(ingredients).values(
        ingredientData.map((ing, i) => ({
          recipeId: id,
          name: ing.name,
          amount: ing.amount ?? null,
          unit: ing.unit ?? null,
          sortOrder: i,
        })),
      )
    }

    await db.delete(steps).where(eq(steps.recipeId, id))
    if (stepData.length > 0) {
      await db.insert(steps).values(
        stepData.map((step, i) => ({
          recipeId: id,
          instruction: step.instruction,
          sortOrder: i,
        })),
      )
    }

    return { success: true }
  })

export const deleteRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()

    await db
      .update(recipes)
      .set({ deletedAt: new Date() })
      .where(and(eq(recipes.id, data.id), eq(recipes.householdId, householdId)))

    return { success: true }
  })

export const restoreRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()

    await db
      .update(recipes)
      .set({ deletedAt: null })
      .where(and(eq(recipes.id, data.id), eq(recipes.householdId, householdId)))

    return { success: true }
  })

export const purgeRecipe = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()

    await db
      .delete(recipes)
      .where(and(eq(recipes.id, data.id), eq(recipes.householdId, householdId)))

    return { success: true }
  })

export const toggleFavorite = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()

    const recipe = await db.query.recipes.findFirst({
      where: and(
        eq(recipes.id, data.id),
        eq(recipes.householdId, householdId),
      ),
    })

    if (!recipe) throw new Error("Recipe not found")

    await db
      .update(recipes)
      .set({ isFavorite: !recipe.isFavorite })
      .where(eq(recipes.id, data.id))

    return { isFavorite: !recipe.isFavorite }
  })

export const getTrashedRecipes = createServerFn({ method: "GET" }).handler(
  async () => {
    const { householdId } = await ensureSession()

    return db
      .select()
      .from(recipes)
      .where(
        and(
          eq(recipes.householdId, householdId),
          sql`${recipes.deletedAt} IS NOT NULL`,
        ),
      )
      .orderBy(desc(recipes.deletedAt))
  },
)

export const getRecentRecipes = createServerFn({ method: "GET" })
  .inputValidator((data: { limit?: number }) => data)
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()

    return db
      .select()
      .from(recipes)
      .where(
        and(eq(recipes.householdId, householdId), isNull(recipes.deletedAt)),
      )
      .orderBy(desc(recipes.updatedAt))
      .limit(data.limit || 20)
  })
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat(recipes): add all recipe server functions"
```

---

## Task 7: Recipe List Page + Card Component

**Files:**
- Create: `src/components/recipes/recipe-card.tsx`
- Create: `src/routes/_authed/recipes.tsx`

- [ ] **Step 1: Create src/components/recipes/recipe-card.tsx**

```typescript
import { Link } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RecipeCardProps {
  id: string
  title: string
  emoji: string
  category: string
  prepTimeMin: number | null
  cookTimeMin: number | null
  difficulty: string
  cuisine: string
  isFavorite: boolean
}

export function RecipeCard({
  id,
  title,
  emoji,
  category,
  prepTimeMin,
  cookTimeMin,
  difficulty,
  cuisine,
  isFavorite,
}: RecipeCardProps) {
  const totalTime =
    (prepTimeMin || 0) + (cookTimeMin || 0) || null

  return (
    <Link to="/recipes/$id" params={{ id }}>
      <Card className="group cursor-pointer transition-colors hover:bg-accent/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{title}</h3>
                {isFavorite && <span className="text-sm">❤️</span>}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary" className="text-xs">
                  {category}
                </Badge>
                {cuisine && (
                  <Badge variant="outline" className="text-xs">
                    {cuisine}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs capitalize">
                  {difficulty}
                </Badge>
              </div>
              {totalTime && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  ⏱️ {totalTime} min
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 2: Create src/routes/_authed/recipes.tsx**

```typescript
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { getRecipes } from "@/server/functions/recipes"
import { RecipeCard } from "@/components/recipes/recipe-card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RecipeSearch {
  search?: string
}

export const Route = createFileRoute("/_authed/recipes")({
  validateSearch: (search: Record<string, unknown>): RecipeSearch => ({
    search: (search.search as string) || undefined,
  }),
  loaderDeps: ({ search }) => ({ search: search.search }),
  loader: async ({ deps }) => {
    return getRecipes({ data: { search: deps.search } })
  },
  component: RecipesPage,
})

function RecipesPage() {
  const allRecipes = Route.useLoaderData()
  const { search: initialSearch } = Route.useSearch()
  const [search, setSearch] = useState(initialSearch || "")
  const [category, setCategory] = useState<string>("all")
  const [difficulty, setDifficulty] = useState<string>("all")

  const filtered = allRecipes.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()))
      return false
    if (category !== "all" && r.category !== category) return false
    if (difficulty !== "all" && r.difficulty !== difficulty) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search recipes..."
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="main">Main</SelectItem>
            <SelectItem value="appetizer">Appetizer</SelectItem>
            <SelectItem value="side">Side</SelectItem>
            <SelectItem value="dessert">Dessert</SelectItem>
            <SelectItem value="drink">Drink</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-4xl mb-2">🍽️</p>
          <p>No recipes found</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify recipe list page**

Run: `pnpm dev`
Navigate to `/recipes` — should show empty state or filtered recipe grid
Expected: Filters and search work, cards are clickable

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(recipes): add recipe list page with card component and filters"
```

---

## Task 8: Recipe Create/Edit Form

**Files:**
- Create: `src/components/recipes/recipe-form.tsx`
- Create: `src/routes/_authed/recipes.new.tsx`
- Create: `src/routes/_authed/recipes.$id.edit.tsx`

- [ ] **Step 1: Create src/components/recipes/recipe-form.tsx**

```typescript
import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface IngredientRow {
  name: string
  amount: string
  unit: string
}

interface StepRow {
  instruction: string
}

interface RecipeFormData {
  title: string
  description: string
  emoji: string
  prepTimeMin: string
  cookTimeMin: string
  servings: string
  difficulty: string
  category: string
  cuisine: string
  calories: string
  proteinPct: string
  carbsPct: string
  fatPct: string
  ingredients: IngredientRow[]
  steps: StepRow[]
}

interface RecipeFormProps {
  initialData?: RecipeFormData
  onSubmit: (data: RecipeFormData) => Promise<void>
  submitLabel: string
}

const defaultData: RecipeFormData = {
  title: "",
  description: "",
  emoji: "🍽️",
  prepTimeMin: "",
  cookTimeMin: "",
  servings: "4",
  difficulty: "easy",
  category: "main",
  cuisine: "",
  calories: "",
  proteinPct: "",
  carbsPct: "",
  fatPct: "",
  ingredients: [{ name: "", amount: "", unit: "" }],
  steps: [{ instruction: "" }],
}

const emojis = ["🍽️", "🍕", "🍔", "🍣", "🍜", "🥗", "🍰", "🍪", "☕", "🧁", "🥘", "🍲", "🌮", "🥙", "🍱"]

export function RecipeForm({
  initialData,
  onSubmit,
  submitLabel,
}: RecipeFormProps) {
  const navigate = useNavigate()
  const [data, setData] = useState<RecipeFormData>(initialData || defaultData)
  const [loading, setLoading] = useState(false)

  function update(field: keyof RecipeFormData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  function updateIngredient(
    index: number,
    field: keyof IngredientRow,
    value: string,
  ) {
    setData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing,
      ),
    }))
  }

  function addIngredient() {
    setData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", amount: "", unit: "" }],
    }))
  }

  function removeIngredient(index: number) {
    setData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  function updateStep(index: number, instruction: string) {
    setData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) =>
        i === index ? { instruction } : step,
      ),
    }))
  }

  function addStep() {
    setData((prev) => ({
      ...prev,
      steps: [...prev.steps, { instruction: "" }],
    }))
  }

  function removeStep(index: number) {
    setData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit(data)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Recipe Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Emoji</label>
              <Select value={data.emoji} onValueChange={(v) => update("emoji", v)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {emojis.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={data.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Recipe title"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={data.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Brief description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={data.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main</SelectItem>
                  <SelectItem value="appetizer">Appetizer</SelectItem>
                  <SelectItem value="side">Side</SelectItem>
                  <SelectItem value="dessert">Dessert</SelectItem>
                  <SelectItem value="drink">Drink</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={data.difficulty} onValueChange={(v) => update("difficulty", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cuisine</label>
              <Input
                value={data.cuisine}
                onChange={(e) => update("cuisine", e.target.value)}
                placeholder="e.g. Italian"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prep (min)</label>
              <Input
                type="number"
                value={data.prepTimeMin}
                onChange={(e) => update("prepTimeMin", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cook (min)</label>
              <Input
                type="number"
                value={data.cookTimeMin}
                onChange={(e) => update("cookTimeMin", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Servings</label>
              <Input
                type="number"
                value={data.servings}
                onChange={(e) => update("servings", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nutrition (per serving)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Calories</label>
              <Input
                type="number"
                value={data.calories}
                onChange={(e) => update("calories", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Protein %</label>
              <Input
                type="number"
                value={data.proteinPct}
                onChange={(e) => update("proteinPct", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Carbs %</label>
              <Input
                type="number"
                value={data.carbsPct}
                onChange={(e) => update("carbsPct", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fat %</label>
              <Input
                type="number"
                value={data.fatPct}
                onChange={(e) => update("fatPct", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Ingredients</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
            + Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                placeholder="Amount"
                className="w-20"
                value={ing.amount}
                onChange={(e) => updateIngredient(i, "amount", e.target.value)}
              />
              <Input
                placeholder="Unit"
                className="w-20"
                value={ing.unit}
                onChange={(e) => updateIngredient(i, "unit", e.target.value)}
              />
              <Input
                placeholder="Ingredient name"
                className="flex-1"
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                required
              />
              {data.ingredients.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeIngredient(i)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Steps</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            + Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.steps.map((step, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="mt-2.5 text-sm font-medium text-muted-foreground w-6 shrink-0">
                {i + 1}.
              </span>
              <Textarea
                placeholder="Describe this step..."
                value={step.instruction}
                onChange={(e) => updateStep(i, e.target.value)}
                rows={2}
                className="flex-1"
                required
              />
              {data.steps.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => removeStep(i)}
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ to: "/recipes" })}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create src/routes/_authed/recipes.new.tsx**

```typescript
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { createRecipe } from "@/server/functions/recipes"
import { RecipeForm } from "@/components/recipes/recipe-form"

export const Route = createFileRoute("/_authed/recipes/new")({
  component: NewRecipePage,
})

function NewRecipePage() {
  const navigate = useNavigate()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Recipe</h1>
      <RecipeForm
        submitLabel="Create Recipe"
        onSubmit={async (formData) => {
          const recipe = await createRecipe({
            data: {
              title: formData.title,
              description: formData.description || undefined,
              emoji: formData.emoji,
              prepTimeMin: formData.prepTimeMin
                ? parseInt(formData.prepTimeMin)
                : undefined,
              cookTimeMin: formData.cookTimeMin
                ? parseInt(formData.cookTimeMin)
                : undefined,
              servings: formData.servings
                ? parseInt(formData.servings)
                : undefined,
              difficulty: formData.difficulty,
              category: formData.category,
              cuisine: formData.cuisine,
              calories: formData.calories
                ? parseInt(formData.calories)
                : undefined,
              proteinPct: formData.proteinPct
                ? parseInt(formData.proteinPct)
                : undefined,
              carbsPct: formData.carbsPct
                ? parseInt(formData.carbsPct)
                : undefined,
              fatPct: formData.fatPct
                ? parseInt(formData.fatPct)
                : undefined,
              ingredients: formData.ingredients.filter((i) => i.name),
              steps: formData.steps.filter((s) => s.instruction),
            },
          })
          navigate({ to: "/recipes/$id", params: { id: recipe.id } })
        }}
      />
    </div>
  )
}
```

- [ ] **Step 3: Create src/routes/_authed/recipes.$id.edit.tsx**

```typescript
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { getRecipe, updateRecipe } from "@/server/functions/recipes"
import { RecipeForm } from "@/components/recipes/recipe-form"

export const Route = createFileRoute("/_authed/recipes/$id/edit")({
  loader: async ({ params }) => {
    return getRecipe({ data: { id: params.id } })
  },
  component: EditRecipePage,
})

function EditRecipePage() {
  const recipe = Route.useLoaderData()
  const navigate = useNavigate()

  const initialData = {
    title: recipe.title,
    description: recipe.description || "",
    emoji: recipe.emoji,
    prepTimeMin: recipe.prepTimeMin?.toString() || "",
    cookTimeMin: recipe.cookTimeMin?.toString() || "",
    servings: recipe.servings.toString(),
    difficulty: recipe.difficulty,
    category: recipe.category,
    cuisine: recipe.cuisine,
    calories: recipe.calories?.toString() || "",
    proteinPct: recipe.proteinPct?.toString() || "",
    carbsPct: recipe.carbsPct?.toString() || "",
    fatPct: recipe.fatPct?.toString() || "",
    ingredients: recipe.ingredients.map((i) => ({
      name: i.name,
      amount: i.amount?.toString() || "",
      unit: i.unit || "",
    })),
    steps: recipe.steps.map((s) => ({ instruction: s.instruction })),
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Recipe</h1>
      <RecipeForm
        initialData={initialData}
        submitLabel="Save Changes"
        onSubmit={async (formData) => {
          await updateRecipe({
            data: {
              id: recipe.id,
              title: formData.title,
              description: formData.description || undefined,
              emoji: formData.emoji,
              prepTimeMin: formData.prepTimeMin
                ? parseInt(formData.prepTimeMin)
                : undefined,
              cookTimeMin: formData.cookTimeMin
                ? parseInt(formData.cookTimeMin)
                : undefined,
              servings: formData.servings
                ? parseInt(formData.servings)
                : undefined,
              difficulty: formData.difficulty,
              category: formData.category,
              cuisine: formData.cuisine,
              calories: formData.calories
                ? parseInt(formData.calories)
                : undefined,
              proteinPct: formData.proteinPct
                ? parseInt(formData.proteinPct)
                : undefined,
              carbsPct: formData.carbsPct
                ? parseInt(formData.carbsPct)
                : undefined,
              fatPct: formData.fatPct
                ? parseInt(formData.fatPct)
                : undefined,
              ingredients: formData.ingredients.filter((i) => i.name),
              steps: formData.steps.filter((s) => s.instruction),
            },
          })
          navigate({ to: "/recipes/$id", params: { id: recipe.id } })
        }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Verify create and edit flows**

Run: `pnpm dev`
1. Navigate to `/recipes/new`, fill in a recipe, submit
2. Navigate to `/recipes/<id>/edit`, modify, save
Expected: Recipe is created/updated in database

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(recipes): add create and edit recipe forms"
```

---

## Task 9: Cook Log Server Functions

**Files:**
- Create: `src/server/functions/cook-log.ts`

- [ ] **Step 1: Create src/server/functions/cook-log.ts**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { db } from "@/server/db"
import { cookLog } from "@/server/db/schema"
import { eq, and, desc, sql, gte } from "drizzle-orm"
import { ensureSession } from "@/lib/auth.functions"

export const logCook = createServerFn({ method: "POST" })
  .inputValidator((data: { recipeId: string }) => data)
  .handler(async ({ data }) => {
    const { user } = await ensureSession()

    const [entry] = await db
      .insert(cookLog)
      .values({
        recipeId: data.recipeId,
        cookedBy: user.id,
      })
      .returning()

    return entry
  })

export const getCookingStreak = createServerFn({ method: "GET" }).handler(
  async () => {
    const { householdId } = await ensureSession()

    const result = await db.execute(sql`
      WITH daily_cooks AS (
        SELECT DISTINCT DATE(cl.cooked_at) as cook_date
        FROM cook_log cl
        JOIN recipes r ON r.id = cl.recipe_id
        WHERE r.household_id = ${householdId}
        ORDER BY cook_date DESC
      ),
      streaks AS (
        SELECT cook_date,
               cook_date - (ROW_NUMBER() OVER (ORDER BY cook_date DESC))::int * INTERVAL '1 day' as grp
        FROM daily_cooks
      )
      SELECT COUNT(*) as streak
      FROM streaks
      WHERE grp = (SELECT grp FROM streaks LIMIT 1)
    `)

    return { streak: Number(result.rows[0]?.streak ?? 0) }
  },
)

export const getWeeklyGoals = createServerFn({ method: "GET" }).handler(
  async () => {
    const { householdId } = await ensureSession()

    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)

    const result = await db.execute(sql`
      SELECT COUNT(*) as cooked_count
      FROM cook_log cl
      JOIN recipes r ON r.id = cl.recipe_id
      WHERE r.household_id = ${householdId}
        AND cl.cooked_at >= ${startOfWeek.toISOString()}
    `)

    const cookedCount = Number(result.rows[0]?.cooked_count ?? 0)
    const target = 5

    return { cookedCount, target, percentage: Math.min(Math.round((cookedCount / target) * 100), 100) }
  },
)
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat(cook-log): add cook log, streak, and weekly goals functions"
```

---

## Task 10: Recipe Detail Page

**Files:**
- Create: `src/routes/_authed/recipes.$id.tsx`

- [ ] **Step 1: Create src/routes/_authed/recipes.$id.tsx**

```typescript
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router"
import {
  getRecipe,
  deleteRecipe,
  toggleFavorite,
} from "@/server/functions/recipes"
import { logCook } from "@/server/functions/cook-log"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"

export const Route = createFileRoute("/_authed/recipes/$id")({
  loader: async ({ params }) => {
    return getRecipe({ data: { id: params.id } })
  },
  component: RecipeDetailPage,
})

function RecipeDetailPage() {
  const recipe = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()

  const totalTime =
    (recipe.prepTimeMin || 0) + (recipe.cookTimeMin || 0) || null

  async function handleDelete() {
    await deleteRecipe({ data: { id: recipe.id } })
    navigate({ to: "/recipes" })
  }

  async function handleFavorite() {
    await toggleFavorite({ data: { id: recipe.id } })
    router.invalidate()
  }

  async function handleCook() {
    await logCook({ data: { recipeId: recipe.id } })
    router.invalidate()
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{recipe.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold">{recipe.title}</h1>
            {recipe.description && (
              <p className="mt-1 text-muted-foreground">
                {recipe.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCook}>
            🍳 I made this
          </Button>
          <Button variant="outline" size="sm" onClick={handleFavorite}>
            {recipe.isFavorite ? "❤️" : "🤍"}
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/recipes/$id/edit" params={{ id: recipe.id }}>
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete recipe?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will move the recipe to trash. You can restore it within
                  30 days.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge>{recipe.category}</Badge>
        {recipe.cuisine && <Badge variant="outline">{recipe.cuisine}</Badge>}
        <Badge variant="outline" className="capitalize">
          {recipe.difficulty}
        </Badge>
        {totalTime && (
          <Badge variant="secondary">⏱️ {totalTime} min</Badge>
        )}
        <Badge variant="secondary">🍽️ {recipe.servings} servings</Badge>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="flex gap-2 text-sm">
                  <span className="font-medium">
                    {ing.amount && `${ing.amount} ${ing.unit || ""}`}
                  </span>
                  <span>{ing.name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {recipe.calories && (
          <Card>
            <CardHeader>
              <CardTitle>Nutrition (per serving)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-3xl font-bold">{recipe.calories} cal</p>
              {recipe.proteinPct != null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Protein</span>
                    <span>{recipe.proteinPct}%</span>
                  </div>
                  <Progress value={recipe.proteinPct} className="h-2" />
                </div>
              )}
              {recipe.carbsPct != null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Carbs</span>
                    <span>{recipe.carbsPct}%</span>
                  </div>
                  <Progress value={recipe.carbsPct} className="h-2" />
                </div>
              )}
              {recipe.fatPct != null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Fat</span>
                    <span>{recipe.fatPct}%</span>
                  </div>
                  <Progress value={recipe.fatPct} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={step.id} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed">{step.instruction}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Verify recipe detail page**

Run: `pnpm dev`
Navigate to a recipe detail page — should show full recipe with all actions
Expected: Favorite toggle, "I made this", edit link, delete dialog all work

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "feat(recipes): add recipe detail page with actions"
```

---

## Task 11: Favorites, Recent, and Trash Pages

**Files:**
- Create: `src/routes/_authed/favorites.tsx`
- Create: `src/routes/_authed/recent.tsx`
- Create: `src/routes/_authed/trash.tsx`

- [ ] **Step 1: Create src/routes/_authed/favorites.tsx**

```typescript
import { createFileRoute } from "@tanstack/react-router"
import { getRecipes } from "@/server/functions/recipes"
import { RecipeCard } from "@/components/recipes/recipe-card"

export const Route = createFileRoute("/_authed/favorites")({
  loader: async () => {
    return getRecipes({ data: { favoritesOnly: true } })
  },
  component: FavoritesPage,
})

function FavoritesPage() {
  const recipes = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Favorites</h1>
      {recipes.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-4xl mb-2">❤️</p>
          <p>No favorite recipes yet</p>
          <p className="text-sm">Click the heart icon on a recipe to add it here</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create src/routes/_authed/recent.tsx**

```typescript
import { createFileRoute } from "@tanstack/react-router"
import { getRecentRecipes } from "@/server/functions/recipes"
import { RecipeCard } from "@/components/recipes/recipe-card"

export const Route = createFileRoute("/_authed/recent")({
  loader: async () => {
    return getRecentRecipes({ data: { limit: 20 } })
  },
  component: RecentPage,
})

function RecentPage() {
  const recipes = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Recent</h1>
      {recipes.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-4xl mb-2">🕐</p>
          <p>No recent recipes</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create src/routes/_authed/trash.tsx**

```typescript
import { createFileRoute, useRouter } from "@tanstack/react-router"
import {
  getTrashedRecipes,
  restoreRecipe,
  purgeRecipe,
} from "@/server/functions/recipes"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const Route = createFileRoute("/_authed/trash")({
  loader: async () => {
    return getTrashedRecipes()
  },
  component: TrashPage,
})

function TrashPage() {
  const recipes = Route.useLoaderData()
  const router = useRouter()

  async function handleRestore(id: string) {
    await restoreRecipe({ data: { id } })
    router.invalidate()
  }

  async function handlePurge(id: string) {
    await purgeRecipe({ data: { id } })
    router.invalidate()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Trash</h1>
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
        Recipes in trash are permanently deleted after 30 days.
      </div>

      {recipes.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-4xl mb-2">🗑️</p>
          <p>Trash is empty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{recipe.emoji}</span>
                  <div>
                    <p className="font-medium">{recipe.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Deleted{" "}
                      {recipe.deletedAt
                        ? new Date(recipe.deletedAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(recipe.id)}
                  >
                    Restore
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete Forever
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Permanently delete "{recipe.title}"?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handlePurge(recipe.id)}
                        >
                          Delete Forever
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(recipes): add favorites, recent, and trash pages"
```

---

## Task 12: Collections Server Functions + Pages

**Files:**
- Create: `src/server/functions/collections.ts`
- Create: `src/routes/_authed/collections.tsx`
- Create: `src/routes/_authed/collections.$id.tsx`
- Modify: `src/components/sidebar/app-sidebar.tsx` (dynamic collections list)

- [ ] **Step 1: Create src/server/functions/collections.ts**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { db } from "@/server/db"
import {
  collections,
  collectionRecipes,
  recipes,
} from "@/server/db/schema"
import { eq, and, isNull, sql, desc } from "drizzle-orm"
import { ensureSession } from "@/lib/auth.functions"

export const getCollections = createServerFn({ method: "GET" }).handler(
  async () => {
    const { householdId } = await ensureSession()

    const result = await db
      .select({
        id: collections.id,
        name: collections.name,
        emoji: collections.emoji,
        color: collections.color,
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

    return result
  },
)

export const getCollection = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()

    const collection = await db.query.collections.findFirst({
      where: and(
        eq(collections.id, data.id),
        eq(collections.householdId, householdId),
      ),
    })

    if (!collection) throw new Error("Collection not found")

    const collectionWithRecipes = await db
      .select({
        recipe: recipes,
      })
      .from(collectionRecipes)
      .innerJoin(recipes, eq(collectionRecipes.recipeId, recipes.id))
      .where(
        and(
          eq(collectionRecipes.collectionId, data.id),
          isNull(recipes.deletedAt),
        ),
      )

    return {
      ...collection,
      recipes: collectionWithRecipes.map((cr) => cr.recipe),
    }
  })

export const createCollection = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { name: string; emoji?: string; color: string }) => data,
  )
  .handler(async ({ data }) => {
    const { householdId, user } = await ensureSession()

    const [collection] = await db
      .insert(collections)
      .values({
        name: data.name,
        emoji: data.emoji || null,
        color: data.color,
        householdId,
        createdBy: user.id,
      })
      .returning()

    return collection
  })

export const updateCollection = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { id: string; name: string; emoji?: string; color: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()

    await db
      .update(collections)
      .set({
        name: data.name,
        emoji: data.emoji || null,
        color: data.color,
      })
      .where(
        and(
          eq(collections.id, data.id),
          eq(collections.householdId, householdId),
        ),
      )

    return { success: true }
  })

export const deleteCollection = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()

    await db
      .delete(collections)
      .where(
        and(
          eq(collections.id, data.id),
          eq(collections.householdId, householdId),
        ),
      )

    return { success: true }
  })

export const addToCollection = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { collectionId: string; recipeId: string }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSession()

    await db
      .insert(collectionRecipes)
      .values({
        collectionId: data.collectionId,
        recipeId: data.recipeId,
      })
      .onConflictDoNothing()

    return { success: true }
  })

export const removeFromCollection = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { collectionId: string; recipeId: string }) => data,
  )
  .handler(async ({ data }) => {
    await ensureSession()

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
```

- [ ] **Step 2: Create src/routes/_authed/collections.tsx**

```typescript
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import {
  getCollections,
  createCollection,
} from "@/server/functions/collections"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Link } from "@tanstack/react-router"

const colors = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#9b59b6",
  "#f39c12",
  "#1abc9c",
  "#e67e22",
  "#34495e",
]

export const Route = createFileRoute("/_authed/collections")({
  loader: async () => {
    return getCollections()
  },
  component: CollectionsPage,
})

function CollectionsPage() {
  const collections = Route.useLoaderData()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("📁")
  const [color, setColor] = useState("#e74c3c")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await createCollection({ data: { name, emoji, color } })
    setOpen(false)
    setName("")
    router.invalidate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collections</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">+ New Collection</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex gap-3">
                <Input
                  className="w-16 text-center text-xl"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                />
                <Input
                  placeholder="Collection name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        borderColor:
                          c === color ? "var(--foreground)" : "transparent",
                      }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-4xl mb-2">📁</p>
          <p>No collections yet</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <Link
              key={col.id}
              to="/collections/$id"
              params={{ id: col.id }}
            >
              <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center gap-3 p-4">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="text-xl">{col.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{col.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {col.recipeCount} recipe{col.recipeCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create src/routes/_authed/collections.$id.tsx**

```typescript
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router"
import { useState } from "react"
import {
  getCollection,
  deleteCollection,
  removeFromCollection,
  addToCollection,
} from "@/server/functions/collections"
import { getRecipes } from "@/server/functions/recipes"
import { RecipeCard } from "@/components/recipes/recipe-card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

export const Route = createFileRoute("/_authed/collections/$id")({
  loader: async ({ params }) => {
    const [collection, allRecipes] = await Promise.all([
      getCollection({ data: { id: params.id } }),
      getRecipes({ data: {} }),
    ])
    return { collection, allRecipes }
  },
  component: CollectionDetailPage,
})

function CollectionDetailPage() {
  const { collection, allRecipes } = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState("")

  const collectionRecipeIds = new Set(collection.recipes.map((r) => r.id))
  const availableRecipes = allRecipes.filter(
    (r) => !collectionRecipeIds.has(r.id),
  )
  const filteredAvailable = availableRecipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  )

  async function handleRemove(recipeId: string) {
    await removeFromCollection({
      data: { collectionId: collection.id, recipeId },
    })
    router.invalidate()
  }

  async function handleAdd(recipeId: string) {
    await addToCollection({
      data: { collectionId: collection.id, recipeId },
    })
    router.invalidate()
    setAddOpen(false)
  }

  async function handleDelete() {
    await deleteCollection({ data: { id: collection.id } })
    navigate({ to: "/collections" })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: collection.color }}
          />
          <span className="text-2xl">{collection.emoji}</span>
          <h1 className="text-2xl font-bold">{collection.name}</h1>
        </div>
        <div className="flex gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm">+ Add Recipe</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Recipe to Collection</DialogTitle>
              </DialogHeader>
              <Input
                placeholder="Search recipes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredAvailable.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No available recipes
                  </p>
                ) : (
                  filteredAvailable.map((recipe) => (
                    <button
                      key={recipe.id}
                      className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-accent"
                      onClick={() => handleAdd(recipe.id)}
                    >
                      <span>{recipe.emoji}</span>
                      <span className="text-sm">{recipe.title}</span>
                    </button>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Delete Collection
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete "{collection.name}"?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete the collection but not the recipes in it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {collection.recipes.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-4xl mb-2">📁</p>
          <p>No recipes in this collection</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collection.recipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Update sidebar to show dynamic collections**

Modify `src/components/sidebar/app-sidebar.tsx`: Add a `collections` prop and render them in the Collections section. The `_authed.tsx` layout should load collections in `beforeLoad` and pass them via route context, or the sidebar can fetch them independently using a server function call.

For simplicity, add the collections fetch to the `_authed.tsx` layout's `beforeLoad`:

In `src/routes/_authed.tsx`, update `beforeLoad`:
```typescript
import { getCollections } from "@/server/functions/collections"
import { getCookingStreak } from "@/server/functions/cook-log"

// In beforeLoad, after session check:
const [collectionsData, streakData] = await Promise.all([
  getCollections(),
  getCookingStreak(),
])
return { user: session.user, collections: collectionsData, streak: streakData }
```

Then in `AppSidebar`, accept and render `collections` and `streak` props:

```typescript
interface AppSidebarProps {
  user: { id: string; name: string; email: string }
  collections: { id: string; name: string; emoji: string | null; color: string }[]
  streak: { streak: number }
}
```

Replace the static "No collections yet" with:

```typescript
{collections.length === 0 ? (
  <SidebarMenuItem>
    <SidebarMenuButton className="text-muted-foreground text-xs">
      No collections yet
    </SidebarMenuButton>
  </SidebarMenuItem>
) : (
  collections.slice(0, 5).map((col) => (
    <SidebarMenuItem key={col.id}>
      <SidebarMenuButton asChild>
        <Link to="/collections/$id" params={{ id: col.id }}>
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: col.color }}
          />
          <span>{col.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))
)}
```

Replace the static streak with:

```typescript
<div className="flex items-center gap-2 px-2 py-1 text-sm">
  <span>🔥</span>
  <div>
    <p className="text-xs font-semibold">Cooking Streak</p>
    <p className="text-xs text-muted-foreground">{streak.streak} days</p>
  </div>
</div>
```

- [ ] **Step 5: Verify collections flow**

Run: `pnpm dev`
1. Navigate to `/collections`, create a collection
2. Open collection, add a recipe
3. Verify sidebar shows the collection with colored dot
Expected: Full collections CRUD works, sidebar updates

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(collections): add collections CRUD with sidebar integration"
```

---

## Task 13: Meal Plan Server Functions + Page

**Files:**
- Create: `src/server/functions/meal-plan.ts`
- Create: `src/routes/_authed/meal-plan.tsx`

- [ ] **Step 1: Create src/server/functions/meal-plan.ts**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { db } from "@/server/db"
import { mealPlanEntries, recipes } from "@/server/db/schema"
import { eq, and, gte, lte, sql } from "drizzle-orm"
import { ensureSession } from "@/lib/auth.functions"

export const getMealPlan = createServerFn({ method: "GET" })
  .inputValidator((data: { weekStart: string }) => data)
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()

    const start = new Date(data.weekStart)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)

    const entries = await db
      .select({
        id: mealPlanEntries.id,
        date: mealPlanEntries.date,
        slot: mealPlanEntries.slot,
        recipe: {
          id: recipes.id,
          title: recipes.title,
          emoji: recipes.emoji,
        },
      })
      .from(mealPlanEntries)
      .innerJoin(recipes, eq(mealPlanEntries.recipeId, recipes.id))
      .where(
        and(
          eq(mealPlanEntries.householdId, householdId),
          gte(mealPlanEntries.date, start.toISOString().split("T")[0]),
          lte(mealPlanEntries.date, end.toISOString().split("T")[0]),
        ),
      )

    return entries
  })

export const setMealPlanEntry = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { date: string; slot: string; recipeId: string }) => data,
  )
  .handler(async ({ data }) => {
    const { householdId, user } = await ensureSession()

    await db
      .delete(mealPlanEntries)
      .where(
        and(
          eq(mealPlanEntries.householdId, householdId),
          eq(mealPlanEntries.date, data.date),
          eq(mealPlanEntries.slot, data.slot as any),
        ),
      )

    const [entry] = await db
      .insert(mealPlanEntries)
      .values({
        householdId,
        recipeId: data.recipeId,
        date: data.date,
        slot: data.slot as any,
        createdBy: user.id,
      })
      .returning()

    return entry
  })

export const clearMealPlanEntry = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await ensureSession()
    await db.delete(mealPlanEntries).where(eq(mealPlanEntries.id, data.id))
    return { success: true }
  })

export const getTodaysMealPlan = createServerFn({ method: "GET" }).handler(
  async () => {
    const { householdId } = await ensureSession()
    const today = new Date().toISOString().split("T")[0]

    const entries = await db
      .select({
        id: mealPlanEntries.id,
        slot: mealPlanEntries.slot,
        recipe: {
          id: recipes.id,
          title: recipes.title,
          emoji: recipes.emoji,
        },
      })
      .from(mealPlanEntries)
      .innerJoin(recipes, eq(mealPlanEntries.recipeId, recipes.id))
      .where(
        and(
          eq(mealPlanEntries.householdId, householdId),
          eq(mealPlanEntries.date, today),
        ),
      )

    return entries
  },
)
```

- [ ] **Step 2: Create src/routes/_authed/meal-plan.tsx**

```typescript
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import {
  getMealPlan,
  setMealPlanEntry,
  clearMealPlanEntry,
} from "@/server/functions/meal-plan"
import { getRecipes } from "@/server/functions/recipes"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export const Route = createFileRoute("/_authed/meal-plan")({
  loader: async () => {
    const monday = getMonday(new Date())
    const [entries, recipes] = await Promise.all([
      getMealPlan({ data: { weekStart: formatDate(monday) } }),
      getRecipes({ data: {} }),
    ])
    return { entries, recipes, weekStart: formatDate(monday) }
  },
  component: MealPlanPage,
})

function MealPlanPage() {
  const { entries, recipes } = Route.useLoaderData()
  const router = useRouter()
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectDialog, setSelectDialog] = useState<{
    date: string
    slot: string
  } | null>(null)
  const [search, setSearch] = useState("")

  const monday = getMonday(new Date())
  monday.setDate(monday.getDate() + weekOffset * 7)

  const weekDates = DAYS.map((_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return formatDate(d)
  })

  const weekLabel = `${new Date(weekDates[0]).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(weekDates[6]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`

  function getEntry(date: string, slot: string) {
    return entries.find((e) => e.date === date && e.slot === slot)
  }

  async function handleSelect(recipeId: string) {
    if (!selectDialog) return
    await setMealPlanEntry({
      data: {
        date: selectDialog.date,
        slot: selectDialog.slot,
        recipeId,
      },
    })
    setSelectDialog(null)
    router.invalidate()
  }

  async function handleClear(entryId: string) {
    await clearMealPlanEntry({ data: { id: entryId } })
    router.invalidate()
  }

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Meal Plan</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            ← Prev
          </Button>
          <span className="text-sm font-medium min-w-48 text-center">
            {weekLabel}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            Next →
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, di) => (
          <div key={day} className="space-y-2">
            <div className="text-center">
              <p className="text-sm font-medium">{day}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(weekDates[di]).getDate()}
              </p>
            </div>
            {SLOTS.map((slot) => {
              const entry = getEntry(weekDates[di], slot)
              return (
                <Card
                  key={slot}
                  className="cursor-pointer min-h-16 transition-colors hover:bg-accent/50"
                  onClick={() => {
                    if (entry) {
                      handleClear(entry.id)
                    } else {
                      setSelectDialog({ date: weekDates[di], slot })
                    }
                  }}
                >
                  <CardContent className="p-2">
                    <p className="text-[10px] uppercase text-muted-foreground mb-1">
                      {slot}
                    </p>
                    {entry ? (
                      <p className="text-xs truncate">
                        {entry.recipe.emoji} {entry.recipe.title}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">+</p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ))}
      </div>

      <Dialog
        open={!!selectDialog}
        onOpenChange={(open) => !open && setSelectDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Recipe</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                className="flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-accent"
                onClick={() => handleSelect(recipe.id)}
              >
                <span>{recipe.emoji}</span>
                <span className="text-sm">{recipe.title}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 3: Verify meal plan page**

Run: `pnpm dev`
Navigate to `/meal-plan` — should show weekly grid with 7 days x 4 slots
1. Click an empty cell, select a recipe
2. Click a filled cell to clear it
3. Navigate between weeks
Expected: Meal plan CRUD works, week navigation works

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(meal-plan): add weekly meal plan grid with recipe assignment"
```

---

## Task 14: Dashboard Server Functions

**Files:**
- Create: `src/server/functions/dashboard.ts`

- [ ] **Step 1: Create src/server/functions/dashboard.ts**

```typescript
import { createServerFn } from "@tanstack/react-start"
import { db } from "@/server/db"
import { recipes, collections, cookLog } from "@/server/db/schema"
import { eq, and, isNull, sql, desc, avg, count } from "drizzle-orm"
import { ensureSession } from "@/lib/auth.functions"

export const getDashboardStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const { householdId } = await ensureSession()

    const [recipeStats] = await db
      .select({
        total: count(),
        favorites: sql<number>`count(*) filter (where ${recipes.isFavorite} = true)`.as("favorites"),
        avgCalories: avg(recipes.calories),
      })
      .from(recipes)
      .where(
        and(eq(recipes.householdId, householdId), isNull(recipes.deletedAt)),
      )

    const [collectionStats] = await db
      .select({ total: count() })
      .from(collections)
      .where(eq(collections.householdId, householdId))

    return {
      totalRecipes: recipeStats.total,
      favorites: Number(recipeStats.favorites),
      collections: collectionStats.total,
      avgCalories: Math.round(Number(recipeStats.avgCalories) || 0),
    }
  },
)

export const getNutritionOverview = createServerFn({ method: "GET" }).handler(
  async () => {
    const { householdId } = await ensureSession()

    const [result] = await db
      .select({
        avgCalories: avg(recipes.calories),
        avgProtein: avg(recipes.proteinPct),
        avgCarbs: avg(recipes.carbsPct),
        avgFat: avg(recipes.fatPct),
      })
      .from(recipes)
      .where(
        and(
          eq(recipes.householdId, householdId),
          isNull(recipes.deletedAt),
          sql`${recipes.calories} IS NOT NULL`,
        ),
      )

    return {
      avgCalories: Math.round(Number(result.avgCalories) || 0),
      avgProtein: Math.round(Number(result.avgProtein) || 0),
      avgCarbs: Math.round(Number(result.avgCarbs) || 0),
      avgFat: Math.round(Number(result.avgFat) || 0),
    }
  },
)

export const getCategoryBreakdown = createServerFn({ method: "GET" }).handler(
  async () => {
    const { householdId } = await ensureSession()

    const result = await db
      .select({
        category: recipes.category,
        count: count(),
      })
      .from(recipes)
      .where(
        and(eq(recipes.householdId, householdId), isNull(recipes.deletedAt)),
      )
      .groupBy(recipes.category)

    return result
  },
)

export const getDashboardRecentRecipes = createServerFn({
  method: "GET",
}).handler(async () => {
  const { householdId } = await ensureSession()

  return db
    .select({
      id: recipes.id,
      title: recipes.title,
      emoji: recipes.emoji,
      category: recipes.category,
      updatedAt: recipes.updatedAt,
    })
    .from(recipes)
    .where(
      and(eq(recipes.householdId, householdId), isNull(recipes.deletedAt)),
    )
    .orderBy(desc(recipes.updatedAt))
    .limit(5)
})
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat(dashboard): add dashboard aggregation server functions"
```

---

## Task 15: Dashboard Page + Widgets

**Files:**
- Create: `src/components/dashboard/stat-card.tsx`
- Create: `src/components/dashboard/nutrition-overview.tsx`
- Create: `src/components/dashboard/category-chart.tsx`
- Create: `src/components/dashboard/recent-recipes.tsx`
- Create: `src/components/dashboard/todays-meal-plan.tsx`
- Create: `src/components/dashboard/weekly-goals.tsx`
- Modify: `src/routes/_authed/index.tsx`

- [ ] **Step 1: Install Recharts**

```bash
pnpm add recharts
```

- [ ] **Step 2: Create src/components/dashboard/stat-card.tsx**

```typescript
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: number | string
  icon: string
  iconBg: string
}

export function StatCard({ label, value, icon, iconBg }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 3: Create src/components/dashboard/nutrition-overview.tsx**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface NutritionOverviewProps {
  avgCalories: number
  avgProtein: number
  avgCarbs: number
  avgFat: number
}

export function NutritionOverview({
  avgCalories,
  avgProtein,
  avgCarbs,
  avgFat,
}: NutritionOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Nutrition Overview
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          avg. calories/serving
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-4xl font-bold">{avgCalories}</p>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-2))]" />
                Protein
              </span>
              <span>{avgProtein}%</span>
            </div>
            <Progress value={avgProtein} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-3))]" />
                Carbs
              </span>
              <span>{avgCarbs}%</span>
            </div>
            <Progress value={avgCarbs} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-4))]" />
                Fat
              </span>
              <span>{avgFat}%</span>
            </div>
            <Progress value={avgFat} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 4: Create src/components/dashboard/category-chart.tsx**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
]

interface CategoryChartProps {
  data: { category: string; count: number }[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Recipes by Category
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Distribution across categories
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No data yet
          </p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  dataKey="count"
                  nameKey="category"
                >
                  {data.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    value,
                    name.charAt(0).toUpperCase() + name.slice(1),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          {data.map((item, i) => (
            <div key={item.category} className="flex items-center gap-1 text-xs">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="capitalize">{item.category}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: Create src/components/dashboard/recent-recipes.tsx**

```typescript
import { Link } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RecentRecipesProps {
  recipes: {
    id: string
    title: string
    emoji: string
    category: string
    updatedAt: Date
  }[]
}

export function RecentRecipes({ recipes }: RecentRecipesProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Recent Recipes</CardTitle>
        <Link
          to="/recipes"
          className="text-xs text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {recipes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recipes yet
          </p>
        ) : (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                to="/recipes/$id"
                params={{ id: recipe.id }}
                className="flex items-center gap-3 rounded-md p-1 hover:bg-accent/50"
              >
                <span className="text-lg">{recipe.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {recipe.title}
                  </p>
                  <Badge variant="secondary" className="text-[10px] mt-0.5">
                    {recipe.category}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 6: Create src/components/dashboard/todays-meal-plan.tsx**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@tanstack/react-router"

const SLOTS = [
  { key: "breakfast", label: "Breakfast", icon: "🌅" },
  { key: "lunch", label: "Lunch", icon: "☀️" },
  { key: "dinner", label: "Dinner", icon: "🌙" },
  { key: "snack", label: "Snack", icon: "🍿" },
]

interface TodaysMealPlanProps {
  entries: {
    slot: string
    recipe: { id: string; title: string; emoji: string }
  }[]
}

export function TodaysMealPlan({ entries }: TodaysMealPlanProps) {
  const entryBySlot = Object.fromEntries(
    entries.map((e) => [e.slot, e.recipe]),
  )

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">
          Today's Meal Plan
        </CardTitle>
        <Link
          to="/meal-plan"
          className="text-xs text-primary hover:underline"
        >
          Full plan →
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {SLOTS.map(({ key, label, icon }) => {
          const recipe = entryBySlot[key]
          return (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className="w-5 text-center">{icon}</span>
              <span className="w-16 text-xs text-muted-foreground">
                {label}
              </span>
              {recipe ? (
                <span className="truncate">
                  {recipe.emoji} {recipe.title}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 7: Create src/components/dashboard/weekly-goals.tsx**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface WeeklyGoalsProps {
  cookedCount: number
  target: number
  percentage: number
}

export function WeeklyGoals({
  cookedCount,
  target,
  percentage,
}: WeeklyGoalsProps) {
  const circumference = 2 * Math.PI * 36
  const dashoffset = circumference - (percentage / 100) * circumference

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Weekly Goals</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative h-24 w-24">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="6"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{percentage}%</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Recipes Cooked: {cookedCount}/{target}
        </p>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 8: Update src/routes/_authed/index.tsx with all widgets**

```typescript
import { createFileRoute } from "@tanstack/react-router"
import {
  getDashboardStats,
  getNutritionOverview,
  getCategoryBreakdown,
  getDashboardRecentRecipes,
} from "@/server/functions/dashboard"
import { getTodaysMealPlan } from "@/server/functions/meal-plan"
import { getWeeklyGoals } from "@/server/functions/cook-log"
import { StatCard } from "@/components/dashboard/stat-card"
import { NutritionOverview } from "@/components/dashboard/nutrition-overview"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { RecentRecipes } from "@/components/dashboard/recent-recipes"
import { TodaysMealPlan } from "@/components/dashboard/todays-meal-plan"
import { WeeklyGoals } from "@/components/dashboard/weekly-goals"

export const Route = createFileRoute("/_authed/")({
  loader: async () => {
    const [stats, nutrition, categories, recentRecipes, todayMeals, goals] =
      await Promise.all([
        getDashboardStats(),
        getNutritionOverview(),
        getCategoryBreakdown(),
        getDashboardRecentRecipes(),
        getTodaysMealPlan(),
        getWeeklyGoals(),
      ])
    return { stats, nutrition, categories, recentRecipes, todayMeals, goals }
  },
  component: Dashboard,
})

function Dashboard() {
  const { user } = Route.useRouteContext()
  const { stats, nutrition, categories, recentRecipes, todayMeals, goals } =
    Route.useLoaderData()

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {user.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Recipes"
          value={stats.totalRecipes}
          icon="🍽️"
          iconBg="hsl(var(--chart-1) / 0.15)"
        />
        <StatCard
          label="Favorites"
          value={stats.favorites}
          icon="❤️"
          iconBg="hsl(var(--chart-5) / 0.15)"
        />
        <StatCard
          label="Collections"
          value={stats.collections}
          icon="📁"
          iconBg="hsl(var(--chart-2) / 0.15)"
        />
        <StatCard
          label="Avg. Calories"
          value={stats.avgCalories}
          icon="🔥"
          iconBg="hsl(var(--chart-4) / 0.15)"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <NutritionOverview {...nutrition} />
        <CategoryChart data={categories} />
        <RecentRecipes recipes={recentRecipes} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <TodaysMealPlan entries={todayMeals} />
        <WeeklyGoals {...goals} />
      </div>
    </div>
  )
}
```

- [ ] **Step 9: Verify dashboard with all widgets**

Run: `pnpm dev`
Navigate to `/` — should show full dashboard with greeting, stat cards, nutrition, category chart, recent recipes, today's meals, weekly goals
Expected: All widgets render (some may show empty state if no seed data yet)

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat(dashboard): add all 7 dashboard widgets"
```

---

## Task 16: Settings Page

**Files:**
- Create: `src/routes/_authed/settings.tsx`

- [ ] **Step 1: Create src/routes/_authed/settings.tsx**

```typescript
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { createServerFn } from "@tanstack/react-start"
import { db } from "@/server/db"
import { users, households } from "@/server/db/schema"
import { eq } from "drizzle-orm"
import { ensureSession } from "@/lib/auth.functions"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const updateProfile = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const { user } = await ensureSession()
    await db
      .update(users)
      .set({ name: data.name })
      .where(eq(users.id, user.id))
    return { success: true }
  })

const getHousehold = createServerFn({ method: "GET" }).handler(async () => {
  const { householdId } = await ensureSession()
  const household = await db.query.households.findFirst({
    where: eq(households.id, householdId),
  })
  return household
})

const updateHouseholdName = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    const { householdId } = await ensureSession()
    await db
      .update(households)
      .set({ name: data.name, updatedAt: new Date() })
      .where(eq(households.id, householdId))
    return { success: true }
  })

export const Route = createFileRoute("/_authed/settings")({
  loader: async () => {
    const household = await getHousehold()
    return { household }
  },
  component: SettingsPage,
})

function SettingsPage() {
  const { user } = Route.useRouteContext()
  const { household } = Route.useLoaderData()
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [householdName, setHouseholdName] = useState(household?.name || "")

  async function handleProfileSave() {
    await updateProfile({ data: { name } })
    router.invalidate()
  }

  async function handleHouseholdSave() {
    await updateHouseholdName({ data: { name: householdName } })
    router.invalidate()
  }

  async function handleSignOut() {
    await signOut()
    window.location.href = "/login"
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={user.email} disabled />
          </div>
          <Button onClick={handleProfileSave} size="sm">
            Save Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Household</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Household Name</label>
            <Input
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
            />
          </div>
          <Button onClick={handleHouseholdSave} size="sm">
            Save
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Button variant="destructive" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add .
git commit -m "feat(settings): add settings page with profile and household"
```

---

## Task 17: Seed Data

**Files:**
- Create: `src/server/db/seed.ts`

- [ ] **Step 1: Create src/server/db/seed.ts**

This file contains all 18 recipes with realistic ingredients and steps, plus collections, meal plan entries, and cook log data. Due to size, the seed script is structured as a self-contained executable.

```typescript
import "dotenv/config"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import {
  households,
  users,
  recipes,
  ingredients,
  steps,
  collections,
  collectionRecipes,
  mealPlanEntries,
  cookLog,
} from "./schema"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle({ client: sql })

async function seed() {
  console.log("Seeding database...")

  // Clean existing data
  await db.delete(cookLog)
  await db.delete(mealPlanEntries)
  await db.delete(collectionRecipes)
  await db.delete(collections)
  await db.delete(ingredients)
  await db.delete(steps)
  await db.delete(recipes)
  await db.delete(users)
  await db.delete(households)

  // Household
  const [household] = await db
    .insert(households)
    .values({ name: "My Kitchen" })
    .returning()

  // User (must match a Better Auth user — create via signup first, or use this ID)
  const [user] = await db
    .insert(users)
    .values({
      email: "chef@cookbook.app",
      name: "Chef",
      householdId: household.id,
      role: "owner",
    })
    .returning()

  // Recipes
  const recipeData = [
    {
      title: "Classic Margherita Pizza",
      emoji: "🍕",
      description: "A traditional Neapolitan pizza with fresh mozzarella, basil, and San Marzano tomatoes.",
      prepTimeMin: 30, cookTimeMin: 15, servings: 4, difficulty: "easy" as const, category: "main" as const, cuisine: "Italian",
      calories: 266, proteinPct: 15, carbsPct: 50, fatPct: 35,
      ingredients: [
        { name: "Pizza dough", amount: "500", unit: "g" },
        { name: "San Marzano tomatoes", amount: "400", unit: "g" },
        { name: "Fresh mozzarella", amount: "200", unit: "g" },
        { name: "Fresh basil leaves", amount: "10", unit: "leaves" },
        { name: "Extra virgin olive oil", amount: "2", unit: "tbsp" },
        { name: "Salt", amount: "1", unit: "tsp" },
      ],
      steps: [
        "Preheat oven to 250°C (480°F) with a pizza stone if available.",
        "Crush tomatoes by hand and season with salt.",
        "Stretch dough into a 12-inch circle on a floured surface.",
        "Spread crushed tomatoes evenly, leaving a 1-inch border.",
        "Tear mozzarella into pieces and distribute over the pizza.",
        "Bake for 12-15 minutes until crust is golden and cheese is bubbling.",
        "Top with fresh basil and a drizzle of olive oil before serving.",
      ],
    },
    {
      title: "Chicken Tikka Masala",
      emoji: "🍛",
      description: "Tender chicken pieces in a creamy, spiced tomato sauce.",
      prepTimeMin: 20, cookTimeMin: 40, servings: 4, difficulty: "medium" as const, category: "main" as const, cuisine: "Indian",
      calories: 320, proteinPct: 35, carbsPct: 25, fatPct: 40,
      ingredients: [
        { name: "Chicken breast", amount: "600", unit: "g" },
        { name: "Yogurt", amount: "150", unit: "ml" },
        { name: "Tikka masala paste", amount: "3", unit: "tbsp" },
        { name: "Canned tomatoes", amount: "400", unit: "g" },
        { name: "Heavy cream", amount: "100", unit: "ml" },
        { name: "Onion", amount: "1", unit: "large" },
        { name: "Garlic cloves", amount: "3", unit: "cloves" },
        { name: "Ginger", amount: "1", unit: "tbsp" },
      ],
      steps: [
        "Marinate diced chicken in yogurt and half the tikka paste for 30 minutes.",
        "Sauté diced onion, garlic, and ginger until softened.",
        "Add remaining tikka paste and cook for 1 minute.",
        "Add canned tomatoes and simmer for 15 minutes.",
        "Grill or pan-fry marinated chicken until charred.",
        "Add chicken to the sauce with cream, simmer 10 minutes.",
      ],
    },
    {
      title: "Beef Bulgogi",
      emoji: "🥩",
      description: "Korean marinated beef with sweet and savory flavors, grilled to perfection.",
      prepTimeMin: 15, cookTimeMin: 10, servings: 4, difficulty: "medium" as const, category: "main" as const, cuisine: "Korean",
      calories: 290, proteinPct: 40, carbsPct: 20, fatPct: 40,
      ingredients: [
        { name: "Beef sirloin, thinly sliced", amount: "500", unit: "g" },
        { name: "Soy sauce", amount: "4", unit: "tbsp" },
        { name: "Sesame oil", amount: "2", unit: "tbsp" },
        { name: "Brown sugar", amount: "2", unit: "tbsp" },
        { name: "Garlic", amount: "4", unit: "cloves" },
        { name: "Asian pear, grated", amount: "1", unit: "half" },
      ],
      steps: [
        "Mix soy sauce, sesame oil, sugar, minced garlic, and grated pear.",
        "Marinate sliced beef for at least 2 hours (overnight is best).",
        "Heat a grill or skillet over high heat.",
        "Cook beef in batches, 2-3 minutes per side.",
        "Serve with steamed rice and kimchi.",
      ],
    },
    {
      title: "Salmon Teriyaki",
      emoji: "🐟",
      description: "Glazed salmon fillets with a sweet and tangy teriyaki sauce.",
      prepTimeMin: 10, cookTimeMin: 15, servings: 2, difficulty: "easy" as const, category: "main" as const, cuisine: "Japanese",
      calories: 340, proteinPct: 45, carbsPct: 15, fatPct: 40,
      ingredients: [
        { name: "Salmon fillets", amount: "2", unit: "pieces" },
        { name: "Soy sauce", amount: "3", unit: "tbsp" },
        { name: "Mirin", amount: "2", unit: "tbsp" },
        { name: "Brown sugar", amount: "1", unit: "tbsp" },
        { name: "Ginger, grated", amount: "1", unit: "tsp" },
      ],
      steps: [
        "Mix soy sauce, mirin, sugar, and ginger for the teriyaki sauce.",
        "Pan-sear salmon skin-side down for 4 minutes.",
        "Flip and pour teriyaki sauce over the fillets.",
        "Cook 3-4 more minutes, basting with sauce.",
        "Serve with steamed rice and garnish with sesame seeds.",
      ],
    },
    {
      title: "Mushroom Risotto",
      emoji: "🍄",
      description: "Creamy Italian rice dish with mixed wild mushrooms and Parmesan.",
      prepTimeMin: 10, cookTimeMin: 35, servings: 4, difficulty: "hard" as const, category: "main" as const, cuisine: "Italian",
      calories: 380, proteinPct: 12, carbsPct: 55, fatPct: 33,
      ingredients: [
        { name: "Arborio rice", amount: "300", unit: "g" },
        { name: "Mixed mushrooms", amount: "300", unit: "g" },
        { name: "Vegetable broth", amount: "1", unit: "L" },
        { name: "White wine", amount: "100", unit: "ml" },
        { name: "Parmesan", amount: "60", unit: "g" },
        { name: "Butter", amount: "30", unit: "g" },
        { name: "Shallot", amount: "1", unit: "medium" },
      ],
      steps: [
        "Sauté sliced mushrooms in butter until golden, set aside.",
        "Cook diced shallot in the same pan until translucent.",
        "Add rice and toast for 2 minutes, stirring constantly.",
        "Add wine and stir until absorbed.",
        "Add warm broth one ladle at a time, stirring between additions.",
        "When rice is al dente (~18 min), fold in mushrooms, Parmesan, and butter.",
      ],
    },
    {
      title: "Caesar Salad",
      emoji: "🥗",
      description: "Crisp romaine lettuce with creamy Caesar dressing, croutons, and Parmesan.",
      prepTimeMin: 15, cookTimeMin: 5, servings: 2, difficulty: "easy" as const, category: "side" as const, cuisine: "American",
      calories: 180, proteinPct: 15, carbsPct: 30, fatPct: 55,
      ingredients: [
        { name: "Romaine lettuce", amount: "1", unit: "head" },
        { name: "Caesar dressing", amount: "4", unit: "tbsp" },
        { name: "Parmesan shavings", amount: "30", unit: "g" },
        { name: "Croutons", amount: "1", unit: "cup" },
        { name: "Lemon juice", amount: "1", unit: "tbsp" },
      ],
      steps: [
        "Wash and chop romaine into bite-sized pieces.",
        "Toss lettuce with Caesar dressing and lemon juice.",
        "Top with croutons and Parmesan shavings.",
        "Serve immediately.",
      ],
    },
    {
      title: "Bruschetta",
      emoji: "🍞",
      description: "Toasted bread topped with fresh tomatoes, garlic, and basil.",
      prepTimeMin: 10, cookTimeMin: 5, servings: 4, difficulty: "easy" as const, category: "appetizer" as const, cuisine: "Italian",
      calories: 120, proteinPct: 10, carbsPct: 60, fatPct: 30,
      ingredients: [
        { name: "Baguette", amount: "1", unit: "loaf" },
        { name: "Roma tomatoes", amount: "4", unit: "medium" },
        { name: "Fresh basil", amount: "8", unit: "leaves" },
        { name: "Garlic", amount: "2", unit: "cloves" },
        { name: "Extra virgin olive oil", amount: "3", unit: "tbsp" },
        { name: "Balsamic vinegar", amount: "1", unit: "tbsp" },
      ],
      steps: [
        "Dice tomatoes, chop basil, mince garlic.",
        "Mix tomatoes with basil, garlic, olive oil, and balsamic.",
        "Season with salt and pepper, let sit 10 minutes.",
        "Slice and toast baguette.",
        "Top each slice with tomato mixture and serve.",
      ],
    },
    {
      title: "Spring Rolls",
      emoji: "🥟",
      description: "Fresh Vietnamese rice paper rolls with shrimp, herbs, and peanut dipping sauce.",
      prepTimeMin: 25, cookTimeMin: 5, servings: 4, difficulty: "medium" as const, category: "appetizer" as const, cuisine: "Vietnamese",
      calories: 95, proteinPct: 30, carbsPct: 50, fatPct: 20,
      ingredients: [
        { name: "Rice paper wrappers", amount: "12", unit: "sheets" },
        { name: "Cooked shrimp", amount: "200", unit: "g" },
        { name: "Rice vermicelli", amount: "100", unit: "g" },
        { name: "Fresh mint", amount: "1", unit: "bunch" },
        { name: "Lettuce leaves", amount: "6", unit: "leaves" },
        { name: "Peanut butter", amount: "3", unit: "tbsp" },
        { name: "Hoisin sauce", amount: "2", unit: "tbsp" },
      ],
      steps: [
        "Cook rice vermicelli, drain, and cool.",
        "Dip rice paper in warm water for 10 seconds.",
        "Layer lettuce, vermicelli, shrimp, and mint on the wrapper.",
        "Roll tightly, tucking in the sides.",
        "Mix peanut butter and hoisin for dipping sauce.",
      ],
    },
    {
      title: "Garlic Mashed Potatoes",
      emoji: "🥔",
      description: "Buttery, creamy mashed potatoes with roasted garlic.",
      prepTimeMin: 10, cookTimeMin: 25, servings: 4, difficulty: "easy" as const, category: "side" as const, cuisine: "American",
      calories: 210, proteinPct: 8, carbsPct: 52, fatPct: 40,
      ingredients: [
        { name: "Russet potatoes", amount: "1", unit: "kg" },
        { name: "Butter", amount: "60", unit: "g" },
        { name: "Heavy cream", amount: "100", unit: "ml" },
        { name: "Garlic, roasted", amount: "6", unit: "cloves" },
        { name: "Salt", amount: "1", unit: "tsp" },
      ],
      steps: [
        "Peel and cube potatoes, boil until fork-tender (~20 min).",
        "Roast garlic cloves in olive oil at 200°C for 15 minutes.",
        "Drain potatoes and mash with butter and cream.",
        "Stir in roasted garlic and season with salt.",
      ],
    },
    {
      title: "Greek Moussaka",
      emoji: "🍆",
      description: "Layered eggplant casserole with spiced meat sauce and béchamel topping.",
      prepTimeMin: 30, cookTimeMin: 60, servings: 6, difficulty: "hard" as const, category: "main" as const, cuisine: "Greek",
      calories: 350, proteinPct: 25, carbsPct: 30, fatPct: 45,
      ingredients: [
        { name: "Eggplant", amount: "3", unit: "large" },
        { name: "Ground lamb", amount: "500", unit: "g" },
        { name: "Onion", amount: "1", unit: "large" },
        { name: "Canned tomatoes", amount: "400", unit: "g" },
        { name: "Cinnamon", amount: "1", unit: "tsp" },
        { name: "Béchamel sauce", amount: "500", unit: "ml" },
        { name: "Parmesan", amount: "50", unit: "g" },
      ],
      steps: [
        "Slice eggplant, salt and let drain for 30 minutes.",
        "Brown ground lamb with diced onion.",
        "Add tomatoes, cinnamon, salt, and simmer 20 minutes.",
        "Pan-fry eggplant slices until golden.",
        "Layer eggplant and meat sauce in a baking dish.",
        "Top with béchamel and grated Parmesan.",
        "Bake at 180°C for 40 minutes until golden.",
      ],
    },
    {
      title: "Matcha Latte",
      emoji: "🍵",
      description: "A frothy, earthy Japanese green tea latte.",
      prepTimeMin: 5, cookTimeMin: 0, servings: 1, difficulty: "easy" as const, category: "drink" as const, cuisine: "Japanese",
      calories: 68, proteinPct: 20, carbsPct: 45, fatPct: 35,
      ingredients: [
        { name: "Matcha powder", amount: "2", unit: "tsp" },
        { name: "Hot water", amount: "60", unit: "ml" },
        { name: "Milk", amount: "200", unit: "ml" },
        { name: "Honey", amount: "1", unit: "tsp" },
      ],
      steps: [
        "Sift matcha powder into a bowl to remove lumps.",
        "Add hot water (not boiling, ~80°C) and whisk until frothy.",
        "Heat and froth milk.",
        "Pour matcha into a cup, add honey, top with frothed milk.",
      ],
    },
    {
      title: "Energy Bites",
      emoji: "⚡",
      description: "No-bake protein-packed snack balls with oats, peanut butter, and chocolate chips.",
      prepTimeMin: 15, cookTimeMin: 0, servings: 12, difficulty: "easy" as const, category: "snack" as const, cuisine: "American",
      calories: 142, proteinPct: 15, carbsPct: 50, fatPct: 35,
      ingredients: [
        { name: "Rolled oats", amount: "1", unit: "cup" },
        { name: "Peanut butter", amount: "0.5", unit: "cup" },
        { name: "Honey", amount: "3", unit: "tbsp" },
        { name: "Chocolate chips", amount: "0.25", unit: "cup" },
        { name: "Flax seeds", amount: "2", unit: "tbsp" },
      ],
      steps: [
        "Mix all ingredients in a bowl until combined.",
        "Refrigerate for 30 minutes.",
        "Roll into 12 bite-sized balls.",
        "Store in the fridge for up to one week.",
      ],
    },
    {
      title: "Tiramisu",
      emoji: "🍰",
      description: "Classic Italian layered dessert with coffee-soaked ladyfingers and mascarpone cream.",
      prepTimeMin: 30, cookTimeMin: 0, servings: 8, difficulty: "medium" as const, category: "dessert" as const, cuisine: "Italian",
      calories: 290, proteinPct: 10, carbsPct: 45, fatPct: 45,
      ingredients: [
        { name: "Mascarpone", amount: "500", unit: "g" },
        { name: "Ladyfinger biscuits", amount: "24", unit: "pieces" },
        { name: "Espresso, cooled", amount: "300", unit: "ml" },
        { name: "Egg yolks", amount: "4", unit: "large" },
        { name: "Sugar", amount: "100", unit: "g" },
        { name: "Cocoa powder", amount: "2", unit: "tbsp" },
      ],
      steps: [
        "Whisk egg yolks with sugar until pale and thick.",
        "Fold in mascarpone until smooth.",
        "Dip ladyfingers briefly in espresso.",
        "Layer soaked ladyfingers in a dish, top with mascarpone cream.",
        "Repeat layers, ending with cream.",
        "Dust with cocoa powder and refrigerate 4+ hours.",
      ],
    },
    {
      title: "Mango Sticky Rice",
      emoji: "🥭",
      description: "Sweet Thai dessert with ripe mango served over coconut sticky rice.",
      prepTimeMin: 20, cookTimeMin: 30, servings: 4, difficulty: "medium" as const, category: "dessert" as const, cuisine: "Thai",
      calories: 310, proteinPct: 5, carbsPct: 70, fatPct: 25,
      ingredients: [
        { name: "Sticky (glutinous) rice", amount: "2", unit: "cups" },
        { name: "Coconut milk", amount: "400", unit: "ml" },
        { name: "Sugar", amount: "4", unit: "tbsp" },
        { name: "Salt", amount: "0.5", unit: "tsp" },
        { name: "Ripe mangoes", amount: "2", unit: "large" },
      ],
      steps: [
        "Soak sticky rice in water for at least 4 hours.",
        "Steam rice for 20-25 minutes until translucent.",
        "Heat coconut milk with sugar and salt (don't boil).",
        "Pour half the coconut mixture over the cooked rice, let absorb.",
        "Slice mangoes and serve alongside rice with remaining coconut sauce.",
      ],
    },
    {
      title: "Pad Thai",
      emoji: "🍜",
      description: "Stir-fried rice noodles with shrimp, tofu, peanuts, and tamarind sauce.",
      prepTimeMin: 15, cookTimeMin: 10, servings: 4, difficulty: "medium" as const, category: "main" as const, cuisine: "Thai",
      calories: 380, proteinPct: 20, carbsPct: 55, fatPct: 25,
      ingredients: [
        { name: "Rice noodles", amount: "250", unit: "g" },
        { name: "Shrimp", amount: "200", unit: "g" },
        { name: "Firm tofu", amount: "150", unit: "g" },
        { name: "Tamarind paste", amount: "3", unit: "tbsp" },
        { name: "Fish sauce", amount: "2", unit: "tbsp" },
        { name: "Peanuts, crushed", amount: "3", unit: "tbsp" },
        { name: "Bean sprouts", amount: "1", unit: "cup" },
        { name: "Eggs", amount: "2", unit: "large" },
      ],
      steps: [
        "Soak rice noodles in warm water for 20 minutes, drain.",
        "Mix tamarind paste, fish sauce, and sugar for the sauce.",
        "Stir-fry cubed tofu until golden, set aside.",
        "Cook shrimp, push to side, scramble eggs in the same wok.",
        "Add noodles and sauce, toss everything together.",
        "Top with peanuts, bean sprouts, and lime wedges.",
      ],
    },
    {
      title: "French Onion Soup",
      emoji: "🧅",
      description: "Rich, caramelized onion soup topped with crusty bread and melted Gruyère.",
      prepTimeMin: 10, cookTimeMin: 60, servings: 4, difficulty: "medium" as const, category: "appetizer" as const, cuisine: "French",
      calories: 225, proteinPct: 15, carbsPct: 40, fatPct: 45,
      ingredients: [
        { name: "Yellow onions", amount: "5", unit: "large" },
        { name: "Butter", amount: "40", unit: "g" },
        { name: "Beef broth", amount: "1", unit: "L" },
        { name: "Dry white wine", amount: "100", unit: "ml" },
        { name: "Baguette slices", amount: "4", unit: "thick" },
        { name: "Gruyère cheese", amount: "150", unit: "g" },
      ],
      steps: [
        "Slice onions thinly and cook in butter over low heat for 40 minutes until deeply caramelized.",
        "Add wine and cook until evaporated.",
        "Add beef broth and simmer 20 minutes.",
        "Ladle into oven-safe bowls.",
        "Top with baguette slice and grated Gruyère.",
        "Broil until cheese is bubbly and golden.",
      ],
    },
    {
      title: "Chocolate Lava Cake",
      emoji: "🍫",
      description: "Individual warm chocolate cakes with a molten center.",
      prepTimeMin: 15, cookTimeMin: 14, servings: 4, difficulty: "hard" as const, category: "dessert" as const, cuisine: "French",
      calories: 410, proteinPct: 8, carbsPct: 40, fatPct: 52,
      ingredients: [
        { name: "Dark chocolate", amount: "200", unit: "g" },
        { name: "Butter", amount: "100", unit: "g" },
        { name: "Eggs", amount: "3", unit: "large" },
        { name: "Sugar", amount: "80", unit: "g" },
        { name: "Flour", amount: "30", unit: "g" },
      ],
      steps: [
        "Melt chocolate and butter together, let cool slightly.",
        "Whisk eggs and sugar until thick and pale.",
        "Fold chocolate mixture into eggs, then fold in flour.",
        "Grease and flour 4 ramekins, divide batter evenly.",
        "Bake at 220°C for 12-14 minutes (center should jiggle).",
        "Let rest 1 minute, then invert onto plates.",
      ],
    },
    {
      title: "Guacamole",
      emoji: "🥑",
      description: "Fresh, chunky guacamole with lime, cilantro, and jalapeño.",
      prepTimeMin: 10, cookTimeMin: 0, servings: 4, difficulty: "easy" as const, category: "snack" as const, cuisine: "Mexican",
      calories: 150, proteinPct: 5, carbsPct: 25, fatPct: 70,
      ingredients: [
        { name: "Ripe avocados", amount: "3", unit: "large" },
        { name: "Lime juice", amount: "2", unit: "tbsp" },
        { name: "Red onion, diced", amount: "0.25", unit: "cup" },
        { name: "Cilantro, chopped", amount: "3", unit: "tbsp" },
        { name: "Jalapeño, minced", amount: "1", unit: "small" },
        { name: "Salt", amount: "0.5", unit: "tsp" },
      ],
      steps: [
        "Halve avocados and scoop into a bowl.",
        "Mash with a fork to desired consistency (chunky or smooth).",
        "Stir in lime juice, onion, cilantro, jalapeño, and salt.",
        "Taste and adjust seasoning. Serve with tortilla chips.",
      ],
    },
  ]

  const insertedRecipes = []
  for (const r of recipeData) {
    const { ingredients: ings, steps: stps, ...recipe } = r
    const [inserted] = await db
      .insert(recipes)
      .values({
        ...recipe,
        householdId: household.id,
        createdBy: user.id,
        isFavorite: ["Salmon Teriyaki", "Mushroom Risotto", "Pad Thai", "Tiramisu"].includes(recipe.title),
      })
      .returning()

    await db.insert(ingredients).values(
      ings.map((ing, i) => ({
        recipeId: inserted.id,
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        sortOrder: i,
      })),
    )

    await db.insert(steps).values(
      stps.map((step, i) => ({
        recipeId: inserted.id,
        instruction: step,
        sortOrder: i,
      })),
    )

    insertedRecipes.push(inserted)
  }

  console.log(`Inserted ${insertedRecipes.length} recipes`)

  // Collections
  const italianRecipes = insertedRecipes.filter((r) =>
    ["Classic Margherita Pizza", "Mushroom Risotto", "Bruschetta", "Tiramisu"].includes(r.title),
  )
  const quickRecipes = insertedRecipes.filter((r) =>
    ["Caesar Salad", "Matcha Latte", "Energy Bites", "Guacamole", "Salmon Teriyaki"].includes(r.title),
  )
  const dateRecipes = insertedRecipes.filter((r) =>
    ["Mushroom Risotto", "Chocolate Lava Cake", "French Onion Soup"].includes(r.title),
  )

  const [italian] = await db.insert(collections).values({ name: "Italian Classics", emoji: "🇮🇹", color: "#e74c3c", householdId: household.id, createdBy: user.id }).returning()
  const [quick] = await db.insert(collections).values({ name: "Quick & Easy", emoji: "⚡", color: "#3498db", householdId: household.id, createdBy: user.id }).returning()
  const [date] = await db.insert(collections).values({ name: "Date Night", emoji: "💜", color: "#9b59b6", householdId: household.id, createdBy: user.id }).returning()

  for (const r of italianRecipes) {
    await db.insert(collectionRecipes).values({ collectionId: italian.id, recipeId: r.id })
  }
  for (const r of quickRecipes) {
    await db.insert(collectionRecipes).values({ collectionId: quick.id, recipeId: r.id })
  }
  for (const r of dateRecipes) {
    await db.insert(collectionRecipes).values({ collectionId: date.id, recipeId: r.id })
  }

  console.log("Inserted 3 collections")

  // Meal plan (current week)
  const monday = new Date()
  monday.setDate(monday.getDate() - monday.getDay() + 1)
  monday.setHours(0, 0, 0, 0)

  const mealSlots = [
    { dayOffset: 0, slot: "breakfast", recipeName: "Energy Bites" },
    { dayOffset: 0, slot: "lunch", recipeName: "Caesar Salad" },
    { dayOffset: 0, slot: "dinner", recipeName: "Chicken Tikka Masala" },
    { dayOffset: 1, slot: "breakfast", recipeName: "Matcha Latte" },
    { dayOffset: 1, slot: "dinner", recipeName: "Salmon Teriyaki" },
    { dayOffset: 2, slot: "lunch", recipeName: "Pad Thai" },
    { dayOffset: 2, slot: "dinner", recipeName: "Mushroom Risotto" },
    { dayOffset: 3, slot: "breakfast", recipeName: "Guacamole" },
    { dayOffset: 3, slot: "dinner", recipeName: "Classic Margherita Pizza" },
    { dayOffset: 4, slot: "lunch", recipeName: "Spring Rolls" },
    { dayOffset: 4, slot: "dinner", recipeName: "Beef Bulgogi" },
    { dayOffset: 5, slot: "dinner", recipeName: "Greek Moussaka" },
    { dayOffset: 6, slot: "lunch", recipeName: "French Onion Soup" },
    { dayOffset: 6, slot: "dinner", recipeName: "Chocolate Lava Cake" },
  ]

  for (const { dayOffset, slot, recipeName } of mealSlots) {
    const d = new Date(monday)
    d.setDate(d.getDate() + dayOffset)
    const recipe = insertedRecipes.find((r) => r.title === recipeName)
    if (recipe) {
      await db.insert(mealPlanEntries).values({
        householdId: household.id,
        recipeId: recipe.id,
        date: d.toISOString().split("T")[0],
        slot: slot as any,
        createdBy: user.id,
      })
    }
  }

  console.log("Inserted meal plan entries")

  // Cook log (14 entries over last 10 days)
  for (let i = 0; i < 14; i++) {
    const daysAgo = Math.floor(Math.random() * 10)
    const d = new Date()
    d.setDate(d.getDate() - daysAgo)
    const recipe = insertedRecipes[Math.floor(Math.random() * insertedRecipes.length)]
    await db.insert(cookLog).values({
      recipeId: recipe.id,
      cookedBy: user.id,
      cookedAt: d,
    })
  }

  console.log("Inserted 14 cook log entries")
  console.log("Seed complete!")
}

seed().catch(console.error)
```

- [ ] **Step 2: Run seed**

Run: `pnpm db:seed`
Expected: All data inserted successfully

- [ ] **Step 3: Verify dashboard with seed data**

Run: `pnpm dev`
Navigate to `/` — all widgets should now show real data
Expected: Stats show 18 recipes, 4 favorites, 3 collections, ~240 avg calories. Donut chart, recent recipes, meal plan, and weekly goals all populated.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(seed): add seed data with 18 recipes, collections, meal plan, and cook log"
```

---

## Task 18: Responsive + Polish

**Files:**
- Modify: Various component files for mobile responsiveness

- [ ] **Step 1: Add Sonner toast provider**

In `src/routes/__root.tsx`, add the Toaster component:

```typescript
import { Toaster } from "@/components/ui/sonner"

// Inside RootDocument, after {children}:
<Toaster />
```

- [ ] **Step 2: Add toast feedback to mutations**

Add `toast` calls to recipe create, delete, favorite toggle, collection create, meal plan assignment. Import from sonner:

```typescript
import { toast } from "sonner"

// After successful mutation:
toast.success("Recipe created!")
```

Add to: `recipes.new.tsx`, `recipes.$id.tsx`, `collections.tsx`, `meal-plan.tsx`, `trash.tsx`

- [ ] **Step 3: Verify responsive layout**

Run: `pnpm dev`
1. Resize browser to mobile width (~375px)
2. Verify sidebar becomes a slide-out sheet (shadcn SidebarProvider handles this)
3. Verify dashboard grid stacks vertically
4. Verify recipe cards stack single column
Expected: All pages are usable on mobile

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(polish): add toast feedback and verify responsive layout"
```

---

## Task 19: Deploy to Vercel

**Files:**
- Create: `vercel.json` (if needed)

- [ ] **Step 1: Add .superpowers to .gitignore if not already present**

Verify `.gitignore` includes `.superpowers/`

- [ ] **Step 2: Set environment variables on Vercel**

Using the Vercel CLI or dashboard, set:
- `DATABASE_URL` — your Neon connection string
- `BETTER_AUTH_SECRET` — your auth secret
- `BETTER_AUTH_URL` — your production URL (e.g. `https://cookbook-xyz.vercel.app`)

```bash
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
vercel env add BETTER_AUTH_URL
```

- [ ] **Step 3: Deploy**

```bash
vercel
```

Expected: Build succeeds, preview deployment URL is provided

- [ ] **Step 4: Verify production**

Open the preview URL, create an account, test recipe CRUD, dashboard, collections, meal plan.
Expected: All features work in production

- [ ] **Step 5: Commit any deployment config**

```bash
git add .
git commit -m "chore: configure Vercel deployment"
```
