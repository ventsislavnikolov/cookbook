# Cookbook MVP -- Design Spec

**Date:** 2026-04-11
**Status:** Draft
**Reference:** [Square UI Cookbook](https://square-ui-cookbook.vercel.app/)

---

## 1. Scope

Full-stack recipe collection and meal planning app. MVP includes auth, recipe CRUD, collections, meal planning, and a dashboard with 7 widgets. Pixel-faithful to the Square UI Cookbook reference with light and dark mode.

### In Scope

- Better Auth (email/password), auto-create household on signup
- Sidebar layout matching reference (all sections)
- Recipe CRUD: create, list, view, edit, soft delete, restore, purge, favorite toggle
- Collections CRUD: create, edit, delete, add/remove recipes
- Meal plan: weekly grid, assign/clear/swap recipes in slots, week navigation
- Dashboard: greeting, 4 stat cards, nutrition overview, recent recipes, today's meal plan, recipes by category donut chart, weekly goals
- Cook log: "I made this" button on recipe detail, used for streak + weekly goals
- Cooking streak widget in sidebar
- Seed data (18 recipes, 3 collections, meal plan entries, cook log entries)
- Dark mode with shadcn preset-compatible theming
- Responsive (mobile sidebar becomes sheet)
- Deploy to Vercel

### Out of Scope

- Household invite system / multi-user management
- Image upload (Vercel Blob)
- Tags management
- Global search (Cmd+K)
- Cooking Activity bar chart
- Recipe import from URLs
- Grocery list generation
- Auto-purge of trashed recipes (display "30-day" banner only)

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (SSR) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query |
| Charts | Recharts (via shadcn Chart component) |
| ORM | Drizzle ORM |
| Database | Neon (serverless Postgres) |
| Auth | Better Auth |
| Hosting | Vercel |

---

## 3. Project Structure

```
app/
  routes/
    __root.tsx
    _authed.tsx                 # Auth-guarded layout (sidebar + header)
    _authed/
      index.tsx                 # Dashboard (/)
      recipes.tsx               # Recipe list
      recipes.new.tsx           # Create recipe
      recipes.$id.tsx           # Recipe detail
      recipes.$id.edit.tsx      # Edit recipe
      collections.tsx           # Collections list
      collections.$id.tsx       # Collection detail
      meal-plan.tsx             # Weekly meal planner
      favorites.tsx             # Favorited recipes
      recent.tsx                # Recently viewed
      trash.tsx                 # Soft-deleted recipes
      settings.tsx              # Account settings
    login.tsx
    signup.tsx
  components/
    ui/                         # shadcn/ui primitives
    sidebar/                    # Sidebar + nav sections
    dashboard/                  # Dashboard widget components
    recipes/                    # Recipe-specific components
    collections/                # Collection components
    meal-plan/                  # Meal plan grid components
  server/
    db/
      schema.ts                 # Drizzle schema (all tables)
      seed.ts                   # Seed data
      index.ts                  # DB connection
    functions/
      recipes.ts
      collections.ts
      meal-plan.ts
      dashboard.ts
      cook-log.ts
    auth.ts                     # Better Auth config
  lib/
    utils.ts
    hooks/
  styles/
    app.css                     # Tailwind entry + shadcn theme tokens
```

---

## 4. Data Model

### households

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | varchar(100) | |
| created_at | timestamp | |
| updated_at | timestamp | |

### users

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, from Better Auth |
| email | varchar(255) | unique |
| name | varchar(100) | |
| avatar_url | text | nullable |
| household_id | uuid | FK -> households |
| role | enum | 'owner' / 'member' |
| created_at | timestamp | |

### recipes

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| household_id | uuid | FK -> households |
| title | varchar(200) | |
| description | text | nullable |
| emoji | varchar(10) | visual identifier |
| image_url | text | nullable |
| prep_time_min | integer | nullable |
| cook_time_min | integer | nullable |
| servings | integer | default 4 |
| difficulty | enum | 'easy' / 'medium' / 'hard' |
| category | enum | 'main' / 'appetizer' / 'side' / 'dessert' / 'drink' / 'snack' |
| cuisine | varchar(50) | |
| calories | integer | nullable, per serving |
| protein_pct | integer | nullable |
| carbs_pct | integer | nullable |
| fat_pct | integer | nullable |
| is_favorite | boolean | default false |
| deleted_at | timestamp | nullable, soft delete |
| created_by | uuid | FK -> users |
| created_at | timestamp | |
| updated_at | timestamp | |

### ingredients

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| recipe_id | uuid | FK -> recipes |
| name | varchar(200) | |
| amount | decimal | nullable |
| unit | varchar(30) | nullable |
| sort_order | integer | |

### steps

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| recipe_id | uuid | FK -> recipes |
| instruction | text | |
| sort_order | integer | |

### collections

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| household_id | uuid | FK -> households |
| name | varchar(100) | |
| emoji | varchar(10) | nullable |
| color | varchar(7) | hex, sidebar dot |
| created_by | uuid | FK -> users |
| created_at | timestamp | |

### collection_recipes

| Column | Type | Notes |
|--------|------|-------|
| collection_id | uuid | FK -> collections |
| recipe_id | uuid | FK -> recipes |
| added_at | timestamp | |

### meal_plan_entries

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| household_id | uuid | FK -> households |
| recipe_id | uuid | FK -> recipes |
| date | date | |
| slot | enum | 'breakfast' / 'lunch' / 'dinner' / 'snack' |
| created_by | uuid | FK -> users |

### cook_log

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| recipe_id | uuid | FK -> recipes |
| cooked_by | uuid | FK -> users |
| cooked_at | timestamp | |
| notes | text | nullable |

### Key Decisions

- All queries scoped by `household_id` (enforced in Drizzle `.where()`)
- Auto-create household on signup
- Soft delete on recipes via `deleted_at`
- `cook_log` drives cooking streak and weekly goals

---

## 5. Server Functions

All functions validate auth and scope by `household_id`.

### Recipes

- `getRecipes({ search?, category?, cuisine?, difficulty?, favoritesOnly? })` -- paginated, excludes soft-deleted
- `getRecipe(id)` -- with ingredients, steps
- `createRecipe(data)` -- insert recipe + ingredients + steps
- `updateRecipe(id, data)` -- update recipe + replace ingredients/steps
- `deleteRecipe(id)` -- soft delete
- `restoreRecipe(id)` -- unset deleted_at
- `purgeRecipe(id)` -- hard delete
- `toggleFavorite(id)` -- flip is_favorite

### Collections

- `getCollections()` -- with recipe count
- `getCollection(id)` -- with recipes
- `createCollection(data)` -- insert
- `updateCollection(id, data)` -- update
- `deleteCollection(id)` -- hard delete, cascades junction
- `addToCollection(collectionId, recipeId)` -- junction insert
- `removeFromCollection(collectionId, recipeId)` -- junction delete

### Meal Plan

- `getMealPlan(weekStart)` -- entries for 7-day range with recipe data
- `setMealPlanEntry(date, slot, recipeId)` -- upsert
- `clearMealPlanEntry(id)` -- delete

### Cook Log

- `logCook(recipeId)` -- insert with current timestamp
- `getCookingStreak()` -- consecutive days for household

### Dashboard

- `getDashboardStats()` -- total recipes, favorites, collections, avg calories
- `getRecentRecipes(limit)` -- last 5 by updated_at
- `getNutritionOverview()` -- avg calories, macro percentages
- `getCategoryBreakdown()` -- recipes grouped by category
- `getWeeklyGoals()` -- cook_log this week vs target
- `getTodaysMealPlan()` -- entries for today

### Auth

- Better Auth built-in routes (`/api/auth/*`)
- Auto-create household on signup

---

## 6. UI Layout

### Sidebar (~260px, collapsible)

- **Logo**: Cookbook icon + "Cookbook" / "Square UI" subtitle
- **+ New Recipe** button (navigates to `/recipes/new`)
- **Workspace**: Dashboard, Recipes, Collections, Meal Plan
- **Library**: Favorites, Recent, Trash
- **Collections**: Dynamic list from user's collections (colored dot + name, max 5, "+N more" link)
- **Footer**: Cooking Streak (fire icon, day count, star indicators) + user avatar with name
- **Mobile**: Collapses to slide-out sheet

### Header Bar

- Hamburger toggle (collapses/expands sidebar)
- Page title / breadcrumb
- Search input (filters recipe list by title on `/recipes` page; on other pages, navigates to `/recipes?search=<query>`)
- "+ Add Recipe" CTA button

### Dark Mode Toggle

- In header area
- System preference on first visit
- Manual toggle persists to localStorage
- `.dark` class on `<html>`

---

## 7. Pages

### Dashboard (`/`)

- Greeting: "Good morning/afternoon/evening, Chef" with user name and date
- 4 stat cards row: Total Recipes, Favorites, Collections, Avg. Calories (with colored icons)
- Widget grid (2-3 columns):
  - Nutrition Overview: calorie display + protein/carbs/fat progress bars
  - Recipes by Category: donut chart (Recharts)
  - Recent Recipes: list of 5 most recent with emoji, name, category badge
  - Today's Meal Plan: 4 slots with assigned recipe or empty state
  - Weekly Goals: circular progress ring showing cooked vs target

### Recipes (`/recipes`)

- Searchable, filterable grid of recipe cards
- Filters: category, cuisine, difficulty, favorites only
- Card: emoji, title, category badge, prep+cook time
- Click -> recipe detail

### Recipe Create/Edit (`/recipes/new`, `/recipes/:id/edit`)

- Form: title, description, emoji picker, prep/cook time, servings, difficulty, category, cuisine, calories, macro percentages
- Ingredients: sortable list (name + amount + unit), add/remove rows
- Steps: sortable list (instruction text), add/remove rows

### Recipe Detail (`/recipes/:id`)

- Header: emoji + title, description
- Metadata badges: time, servings, difficulty, cuisine
- Ingredients list, numbered steps
- Nutrition card: calories, macro progress bars
- Actions: "I made this" (log cook), Edit, Delete, Favorite toggle, Add to Collection

### Collections (`/collections`)

- Grid of cards: emoji, name, colored dot, recipe count
- Create button -> dialog (name, emoji, color picker)

### Collection Detail (`/collections/:id`)

- Header: emoji, name, edit/delete actions
- Recipe grid (same card component)
- "Add recipe" -> search/select dialog

### Meal Plan (`/meal-plan`)

- Weekly grid: 7 columns (Mon-Sun) x 4 rows (Breakfast, Lunch, Dinner, Snack)
- Cell: recipe emoji + name, or empty state
- Empty cell click -> recipe search/select
- Filled cell click -> clear or swap
- Week navigation: prev/next with date range

### Favorites (`/favorites`)

- Recipe grid pre-filtered to `is_favorite = true`

### Recent (`/recent`)

- Recipe grid sorted by `updated_at` desc

### Trash (`/trash`)

- Soft-deleted recipe list with Restore and Delete Permanently actions
- Banner: "Recipes in trash are permanently deleted after 30 days"

### Settings (`/settings`)

- Profile: name, avatar
- Household: name
- Display: dark mode toggle

### Login / Signup (`/login`, `/signup`)

- Centered form: email + password
- Toggle between login/signup
- Auto-creates household on first signup

---

## 8. Theming

shadcn/ui HSL-based CSS variable system for full preset compatibility.

### Semantic Variables

| Variable | Purpose |
|----------|---------|
| `--background` | Page background |
| `--foreground` | Primary text |
| `--card` / `--card-foreground` | Card surfaces |
| `--sidebar` / `--sidebar-foreground` | Sidebar |
| `--primary` / `--primary-foreground` | Accent (red CTA buttons, active states) |
| `--secondary` / `--secondary-foreground` | Secondary buttons |
| `--muted` / `--muted-foreground` | Subtle backgrounds, secondary text |
| `--accent` / `--accent-foreground` | Hover states |
| `--destructive` | Delete actions |
| `--border` | All borders |
| `--ring` | Focus rings |
| `--chart-1` through `--chart-5` | Donut chart, progress rings |

### Definition

Light and dark values in `app.css` using shadcn's `@layer base` format:

```css
@layer base {
  :root { /* light HSL values */ }
  .dark { /* dark HSL values */ }
}
```

Swapping a preset = replacing those HSL values. No hardcoded colors in components.

---

## 9. Seed Data

18 recipes covering all categories, cuisines, and difficulties:

| Recipe | Category | Cuisine | Difficulty | Cal |
|--------|----------|---------|------------|-----|
| Classic Margherita Pizza | Main | Italian | Easy | 266 |
| Chicken Tikka Masala | Main | Indian | Medium | 320 |
| Beef Bulgogi | Main | Korean | Medium | 290 |
| Salmon Teriyaki | Main | Japanese | Easy | 340 |
| Mushroom Risotto | Main | Italian | Hard | 380 |
| Caesar Salad | Side | American | Easy | 180 |
| Bruschetta | Appetizer | Italian | Easy | 120 |
| Spring Rolls | Appetizer | Vietnamese | Medium | 95 |
| Garlic Mashed Potatoes | Side | American | Easy | 210 |
| Greek Moussaka | Main | Greek | Hard | 350 |
| Matcha Latte | Drink | Japanese | Easy | 68 |
| Energy Bites | Snack | American | Easy | 142 |
| Tiramisu | Dessert | Italian | Medium | 290 |
| Mango Sticky Rice | Dessert | Thai | Medium | 310 |
| Pad Thai | Main | Thai | Medium | 380 |
| French Onion Soup | Appetizer | French | Medium | 225 |
| Chocolate Lava Cake | Dessert | French | Hard | 410 |
| Guacamole | Snack | Mexican | Easy | 150 |

Each recipe includes 4-8 ingredients and 3-6 steps.

**Additional seed data:**
- 1 household: "My Kitchen"
- 1 user: `chef@cookbook.app` / `password123`
- 3 collections: "Italian Classics" (red), "Quick & Easy" (blue), "Date Night" (purple) with recipes assigned
- 7 days of meal plan entries (current week)
- 14 cook_log entries across last 10 days

---

## 10. Deployment

- Vercel with TanStack Start adapter
- Neon database connection via `DATABASE_URL` env var
- Better Auth env vars: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- Drizzle migrations run via `drizzle-kit push` or `drizzle-kit migrate`
