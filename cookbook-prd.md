# PRD: Cookbook — Recipe Collection & Meal Planner

**Version:** 1.0  
**Author:** Ventsislav  
**Date:** April 11, 2026  
**Status:** Draft

---

## 1. Overview

Cookbook is a full-stack recipe collection and meal planning app designed for households and families. It allows users to save, organize, and plan meals together — with a shared recipe library, weekly meal plans, nutrition tracking, and cooking activity insights.

The UI is modeled after the [Square UI Cookbook](https://square-ui-cookbook.vercel.app/) design, using shadcn/ui components as the foundation.

### 1.1 Goals

- Build a personal/household recipe manager with real CRUD and persistence
- Provide weekly meal planning with drag-and-drop slot assignment
- Track cooking activity, nutrition, and recipe usage over time
- Support household sharing — family members can collaborate on the same recipe library
- Ship a polished, production-grade UI using shadcn/ui and Tailwind

### 1.2 Non-Goals (v1)

- Public recipe marketplace or community features
- AI-powered recipe generation or ingredient substitution
- Grocery list generation (future consideration)
- Mobile native app (responsive web only)
- Recipe import from URLs / scraping

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start (SSR/SSG) |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query |
| Charts | Recharts (via shadcn Chart component) |
| ORM | Drizzle ORM |
| Database | Neon (serverless Postgres) |
| Auth | Better Auth |
| Hosting | Vercel |
| File storage | Vercel Blob (recipe images) |

---

## 3. Information Architecture

### 3.1 Sitemap

```
/                       → Dashboard (authenticated home)
/login                  → Login / Sign up
/recipes                → Recipe list (filterable, searchable)
/recipes/new            → Create recipe form
/recipes/:id            → Recipe detail view
/recipes/:id/edit       → Edit recipe form
/collections            → All collections
/collections/:id        → Collection detail (filtered recipe list)
/meal-plan              → Weekly meal planner (calendar grid)
/favorites              → Favorited recipes
/recent                 → Recently viewed/edited recipes
/trash                  → Soft-deleted recipes (30-day retention)
/settings               → Account, household management, preferences
/settings/household     → Invite members, manage roles
```

### 3.2 Navigation Structure

**Sidebar** (persistent, collapsible):

- **Workspace**: Dashboard, Recipes, Collections, Meal Plan
- **Library**: Favorites, Recent, Trash
- **Collections**: Dynamic list of user collections (max 5 shown, "+N more" link)
- **Footer**: Cooking streak widget, user avatar + household selector

---

## 4. Data Model

### 4.1 Core Entities

#### `households`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| name | varchar(100) | e.g. "The Ngoya Family" |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, from Better Auth |
| email | varchar(255) | unique |
| name | varchar(100) | |
| avatar_url | text | nullable |
| household_id | uuid | FK → households |
| role | enum | 'owner' · 'member' |
| created_at | timestamp | |

#### `recipes`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| household_id | uuid | FK → households |
| title | varchar(200) | |
| description | text | nullable |
| emoji | varchar(10) | visual identifier (e.g. 🍪) |
| image_url | text | nullable, Vercel Blob |
| prep_time_min | integer | nullable |
| cook_time_min | integer | nullable |
| servings | integer | default 4 |
| difficulty | enum | 'easy' · 'medium' · 'hard' |
| category | enum | 'main' · 'appetizer' · 'side' · 'dessert' · 'drink' · 'snack' |
| cuisine | varchar(50) | e.g. "Italian", "Japanese" |
| calories | integer | nullable, per serving |
| protein_pct | integer | nullable |
| carbs_pct | integer | nullable |
| fat_pct | integer | nullable |
| is_favorite | boolean | default false |
| deleted_at | timestamp | nullable, soft delete |
| created_by | uuid | FK → users |
| created_at | timestamp | |
| updated_at | timestamp | |

#### `ingredients`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| recipe_id | uuid | FK → recipes |
| name | varchar(200) | |
| amount | decimal | nullable |
| unit | varchar(30) | nullable (e.g. "g", "cup", "tbsp") |
| sort_order | integer | |

#### `steps`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| recipe_id | uuid | FK → recipes |
| instruction | text | |
| sort_order | integer | |

#### `tags`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| household_id | uuid | FK → households |
| name | varchar(50) | unique per household |

#### `recipe_tags` (junction)
| Column | Type | Notes |
|--------|------|-------|
| recipe_id | uuid | FK → recipes |
| tag_id | uuid | FK → tags |

#### `collections`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| household_id | uuid | FK → households |
| name | varchar(100) | |
| emoji | varchar(10) | nullable |
| color | varchar(7) | hex, for sidebar dot |
| created_by | uuid | FK → users |
| created_at | timestamp | |

#### `collection_recipes` (junction)
| Column | Type | Notes |
|--------|------|-------|
| collection_id | uuid | FK → collections |
| recipe_id | uuid | FK → recipes |
| added_at | timestamp | |

#### `meal_plan_entries`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| household_id | uuid | FK → households |
| recipe_id | uuid | FK → recipes |
| date | date | |
| slot | enum | 'breakfast' · 'lunch' · 'dinner' · 'snack' |
| created_by | uuid | FK → users |

#### `cook_log`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| recipe_id | uuid | FK → recipes |
| cooked_by | uuid | FK → users |
| cooked_at | timestamp | |
| notes | text | nullable |

### 4.2 Key Relationships

- A **household** has many **users**, **recipes**, **collections**, and **meal plan entries**
- A **recipe** belongs to one household, has many ingredients, steps, tags, and cook logs
- A **collection** contains many recipes (many-to-many)
- A **meal plan entry** maps one recipe to one date + slot
- **Cook log** tracks each time a recipe was prepared

### 4.3 Row-Level Security

All queries are scoped by `household_id`. Users can only see data belonging to their household. This is enforced at the query layer in Drizzle (`.where(eq(table.householdId, ctx.householdId))`).

---

## 5. Features (v1)

### 5.1 Dashboard

The primary view after login. Displays:

| Widget | Data source | Notes |
|--------|------------|-------|
| Greeting | user.name, current date | "Good morning, Chef" |
| Stat cards (4) | Aggregated queries | Total Recipes, Favorites, Collections, Cooked (with % change vs. prior period) |
| Cooking Activity chart | cook_log grouped by day | Bar chart, 7-day default, toggle to 30d |
| Nutrition Overview | recipes avg(calories, macros) | Donut/progress bars |
| Today's Meal Plan | meal_plan_entries for today | 4 slots with recipe emoji + name |
| Difficulty Breakdown | recipes grouped by difficulty | Horizontal bar |
| Cuisine Diversity | recipes grouped by cuisine | Flag emoji + count |
| Recipes by Category | recipes grouped by category | Donut chart |
| Recent Recipes | recipes order by updated_at | 5 most recent, card list |
| Weekly Goals | cook_log this week vs targets | Circular progress |
| Popular Tags | recipe_tags count | Tag cloud |
| Quick Collections | collections with recipe count | 6 cards |
| Recent Activity | cook_log + recipe create/update | Timeline feed |
| Top Contributors | users ranked by cook_log count | Avatar + count |
| Cooking Streak | cook_log consecutive days | Sidebar widget |

### 5.2 Recipes

- **List view**: Searchable, filterable grid/list of all recipes. Filters: category, cuisine, difficulty, tags, favorites only
- **Create/Edit**: Form with title, description, emoji picker, image upload, time fields, servings, difficulty, category, cuisine, nutrition, ingredients (sortable list), steps (sortable list), tags (multi-select with create)
- **Detail view**: Full recipe card with ingredients, steps, nutrition, cook button ("I made this"), edit, delete, add to collection, favorite toggle
- **Soft delete**: Moves to trash, auto-purged after 30 days

### 5.3 Collections

- Create/edit collections with name, emoji, color
- Add/remove recipes from collections
- Collection detail page shows filtered recipe grid

### 5.4 Meal Plan

- Weekly calendar grid (Mon–Sun, 4 slots per day)
- Assign recipes to slots via dropdown/search or drag-and-drop
- Navigate between weeks
- "Full plan" view shows the entire week at a glance
- Clear individual slots or entire days

### 5.5 Household & Auth

- **Sign up / Login**: Email + password via Better Auth, Google OAuth optional
- **Household creation**: Auto-created on first sign-up
- **Invite members**: Owner generates invite link, new user joins the household
- **Roles**: Owner (full CRUD + member management) and Member (full CRUD, no member management)
- **Household switching**: Not in v1 (one household per user)

### 5.6 Settings

- Update profile (name, avatar)
- Manage household name
- Invite / remove members (owner only)
- Set weekly cooking goals (recipes/week target)

---

## 6. UI Component Mapping

| UI Element | shadcn Component | Notes |
|------------|-----------------|-------|
| Sidebar | `Sidebar` (from blocks) | Collapsible, with sections |
| Stat cards | `Card` | With icon, value, label, badge for % change |
| Charts | `Chart` (Recharts wrapper) | Bar, Donut, Progress |
| Recipe cards | `Card` | Emoji, title, category badge, time |
| Forms | `Input`, `Textarea`, `Select`, `Switch` | |
| Meal plan grid | Custom grid with `Card` | 7 cols × 4 rows |
| Search | `Input` with `CommandDialog` | Cmd+K global search |
| Tags | `Badge` | Clickable, with count |
| User avatar | `Avatar` | With `DropdownMenu` |
| Modals | `Dialog` | Create/edit flows |
| Confirmations | `AlertDialog` | Delete confirmation |
| Toast | `Sonner` | Success/error feedback |
| Progress | `Progress` | Macro bars, weekly goals |
| Date navigation | `Button` group | Week prev/next |
| Tables | `Table` | Settings, member list |

---

## 7. API / Server Functions

Using TanStack Start server functions (RPC-style, no REST API layer):

### Recipes
- `getRecipes(filters)` → paginated list
- `getRecipe(id)` → single recipe with ingredients, steps, tags
- `createRecipe(data)` → insert recipe + ingredients + steps + tags
- `updateRecipe(id, data)` → update recipe + relations
- `deleteRecipe(id)` → soft delete (set deleted_at)
- `restoreRecipe(id)` → unset deleted_at
- `purgeRecipe(id)` → hard delete (owner only, or auto after 30d)
- `toggleFavorite(id)` → toggle is_favorite

### Collections
- `getCollections()` → list with recipe count
- `getCollection(id)` → collection with recipes
- `createCollection(data)` → insert
- `updateCollection(id, data)` → update
- `deleteCollection(id)` → hard delete
- `addToCollection(collectionId, recipeId)` → junction insert
- `removeFromCollection(collectionId, recipeId)` → junction delete

### Meal Plan
- `getMealPlan(weekStart)` → entries for 7-day range
- `setMealPlanEntry(date, slot, recipeId)` → upsert
- `clearMealPlanEntry(id)` → delete

### Cook Log
- `logCook(recipeId, notes?)` → insert
- `getCookingActivity(range)` → grouped by day
- `getCookingStreak()` → consecutive days count

### Dashboard
- `getDashboardStats(range)` → aggregated stats for all widgets
- `getRecentActivity(limit)` → combined activity feed

### Household
- `getHousehold()` → current household with members
- `updateHousehold(data)` → update name
- `createInvite()` → generate invite token
- `acceptInvite(token)` → join household
- `removeMember(userId)` → owner only

---

## 8. Milestones

### Phase 0 — Scaffold (Week 1)
- [ ] Init TanStack Start project with Router + Query
- [ ] Set up Tailwind 4 + shadcn/ui
- [ ] Configure Drizzle + Neon database
- [ ] Set up Better Auth (email/password)
- [ ] Seed database with sample data (matches Square UI demo)
- [ ] Deploy to Vercel

### Phase 1 — Core CRUD (Weeks 2–3)
- [ ] Sidebar layout + navigation
- [ ] Recipe list page with search and filters
- [ ] Recipe create/edit form (with ingredients + steps)
- [ ] Recipe detail page
- [ ] Soft delete + trash page
- [ ] Favorites toggle + favorites page
- [ ] Recent page

### Phase 2 — Organization (Week 4)
- [ ] Collections CRUD
- [ ] Add/remove recipes from collections
- [ ] Tag management
- [ ] Global search (Cmd+K)

### Phase 3 — Meal Planning (Week 5)
- [ ] Weekly meal plan grid
- [ ] Assign recipes to slots
- [ ] Week navigation
- [ ] Today's meal plan widget on dashboard

### Phase 4 — Dashboard & Analytics (Week 6)
- [ ] Stat cards with period comparison
- [ ] Cooking Activity bar chart
- [ ] Nutrition Overview
- [ ] Difficulty, Cuisine, Category breakdowns
- [ ] Weekly goals + cooking streak
- [ ] Recent activity feed
- [ ] Top contributors
- [ ] Popular tags

### Phase 5 — Household (Week 7)
- [ ] Household settings page
- [ ] Invite link generation + accept flow
- [ ] Member list with role display
- [ ] Row-level data scoping by household

### Phase 6 — Polish (Week 8)
- [ ] Image upload for recipes (Vercel Blob)
- [ ] Responsive layout (mobile sidebar → sheet)
- [ ] Loading states, error boundaries
- [ ] Empty states for all pages
- [ ] Keyboard shortcuts
- [ ] Performance audit + optimizations

---

## 9. Open Questions

1. **Nutrition data** — Manual entry only, or integrate a nutrition API (e.g. Edamam, Nutritionix) for auto-calculation from ingredients?
2. **Recipe sharing** — Should households be able to share individual recipes publicly via link?
3. **Grocery lists** — Is this a v2 feature? Aggregate ingredients from meal plan into a shopping list?
4. **Recipe import** — Scrape recipes from URLs (e.g. AllRecipes, NYT Cooking)? Complex legally and technically — likely v2+.
5. **Offline support** — PWA with service worker for offline recipe viewing?
6. **Drag-and-drop** — Use `@dnd-kit` for meal plan slot assignment and ingredient/step reordering?
7. **Cooking streak logic** — Does any household member cooking count toward the streak, or per-user?

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| Time to first recipe created | < 2 minutes |
| Dashboard load time (LCP) | < 1.5s |
| Weekly active usage (personal) | 3+ sessions/week |
| Recipes in library | 50+ within 3 months |
| Meal plan fill rate | 60%+ slots filled weekly |
