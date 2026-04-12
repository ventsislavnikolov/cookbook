import "dotenv/config"
import { randomUUID } from "crypto"
import { sql as drizzleSql } from "drizzle-orm"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"
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

const sqlClient = neon(process.env.DATABASE_URL!)
const db = drizzle({ client: sqlClient, schema })

const RESET = process.argv.includes("--reset")

async function seed() {
  if (RESET) {
    console.log("Resetting database…")
    await db.execute(drizzleSql`
      TRUNCATE cook_log, meal_plan_entries, collection_recipes,
        collections, steps, ingredients, recipes,
        accounts, sessions, verifications, users, households
      RESTART IDENTITY CASCADE
    `)
    console.log("Tables truncated.")
  }

  console.log("Seeding database…")

  // Household
  const [household] = await db
    .insert(households)
    .values({ name: "The Nikolov Kitchen" })
    .returning()

  console.log("Created household:", household.id)

  // Demo user — created directly, no Better Auth account.
  // Sign up via the app UI to create a real loginable account.
  const [user] = await db
    .insert(users)
    .values({
      id: randomUUID(),
      householdId: household.id,
      name: "Demo User",
      email: "demo@example.com",
      emailVerified: true,
    })
    .returning()

  console.log("Created user:", user.id)

  // Recipes
  const recipeData = [
    {
      title: "Spaghetti Carbonara",
      description:
        "Classic Roman pasta with eggs, guanciale, and Pecorino Romano. Rich and silky with no cream needed.",
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: "medium",
      cuisine: "Italian",
      tags: ["pasta", "comfort food", "classic"],
      isFavorite: true,
      ingredients: [
        { name: "Spaghetti", quantity: "400", unit: "g" },
        { name: "Guanciale or pancetta", quantity: "150", unit: "g" },
        { name: "Eggs", quantity: "4", unit: null },
        { name: "Pecorino Romano", quantity: "100", unit: "g", notes: "finely grated" },
        { name: "Black pepper", quantity: null, unit: null, notes: "freshly cracked, generous amount" },
        { name: "Salt", quantity: null, unit: null, notes: "for pasta water" },
      ],
      steps: [
        { instruction: "Bring a large pot of salted water to a boil and cook spaghetti until al dente, reserving 1 cup of pasta water before draining." },
        { instruction: "Meanwhile, cook guanciale in a cold pan over medium heat until crispy and the fat renders out. Remove from heat." },
        { instruction: "Whisk together eggs, grated Pecorino, and a generous amount of black pepper in a bowl." },
        { instruction: "Add hot drained pasta to the pan with guanciale (off heat). Mix well." },
        { instruction: "Pour egg mixture over pasta, tossing constantly and adding pasta water a splash at a time to create a silky sauce." },
        { instruction: "Serve immediately with extra Pecorino and black pepper." },
      ],
    },
    {
      title: "Chicken Tikka Masala",
      description:
        "Tender marinated chicken in a rich, creamy tomato sauce. A household favourite for good reason.",
      prepTime: 20,
      cookTime: 40,
      servings: 4,
      difficulty: "medium",
      cuisine: "Indian",
      tags: ["curry", "chicken", "weeknight"],
      isFavorite: true,
      ingredients: [
        { name: "Chicken breast", quantity: "700", unit: "g", notes: "cut into chunks" },
        { name: "Yogurt", quantity: "200", unit: "ml" },
        { name: "Garlic", quantity: "4", unit: "cloves" },
        { name: "Fresh ginger", quantity: "2", unit: "cm", notes: "grated" },
        { name: "Garam masala", quantity: "2", unit: "tsp" },
        { name: "Cumin", quantity: "1", unit: "tsp" },
        { name: "Turmeric", quantity: "1/2", unit: "tsp" },
        { name: "Canned tomatoes", quantity: "400", unit: "g" },
        { name: "Heavy cream", quantity: "150", unit: "ml" },
        { name: "Onion", quantity: "1", unit: "large" },
        { name: "Butter", quantity: "2", unit: "tbsp" },
        { name: "Fresh coriander", quantity: null, unit: null, notes: "to garnish" },
      ],
      steps: [
        { instruction: "Marinate chicken in yogurt, half the garlic, ginger, and spices for at least 1 hour (overnight is better)." },
        { instruction: "Grill or broil chicken until slightly charred. Set aside." },
        { instruction: "Sauté onion in butter until golden, then add remaining garlic and ginger." },
        { instruction: "Add garam masala, cumin, and turmeric. Cook for 1 minute until fragrant." },
        { instruction: "Add canned tomatoes and simmer for 15 minutes until sauce thickens." },
        { instruction: "Blend sauce until smooth, then return to pan. Add cream and chicken." },
        { instruction: "Simmer for 10 minutes. Garnish with coriander and serve with rice or naan." },
      ],
    },
    {
      title: "Simple Green Salad",
      description:
        "A crisp, refreshing salad with a lemon-Dijon vinaigrette. Perfect as a side dish or light lunch.",
      prepTime: 10,
      cookTime: 0,
      servings: 2,
      difficulty: "easy",
      cuisine: "French",
      tags: ["salad", "light", "quick", "vegetarian"],
      isFavorite: false,
      ingredients: [
        { name: "Mixed salad leaves", quantity: "150", unit: "g" },
        { name: "Cherry tomatoes", quantity: "100", unit: "g", notes: "halved" },
        { name: "Cucumber", quantity: "1/2", unit: null },
        { name: "Red onion", quantity: "1/4", unit: null, notes: "thinly sliced" },
        { name: "Lemon juice", quantity: "2", unit: "tbsp" },
        { name: "Dijon mustard", quantity: "1", unit: "tsp" },
        { name: "Olive oil", quantity: "3", unit: "tbsp" },
        { name: "Salt and pepper", quantity: null, unit: null },
      ],
      steps: [
        { instruction: "Whisk together lemon juice, Dijon mustard, olive oil, salt, and pepper to make the dressing." },
        { instruction: "Combine salad leaves, tomatoes, cucumber, and red onion in a large bowl." },
        { instruction: "Drizzle dressing over salad just before serving and toss gently." },
      ],
    },
    {
      title: "Banana Bread",
      description:
        "Moist, tender banana bread with optional walnuts. The perfect way to use overripe bananas.",
      prepTime: 15,
      cookTime: 60,
      servings: 8,
      difficulty: "easy",
      cuisine: "American",
      tags: ["baking", "dessert", "breakfast", "vegetarian"],
      isFavorite: false,
      ingredients: [
        { name: "Ripe bananas", quantity: "3", unit: "large", notes: "mashed" },
        { name: "Plain flour", quantity: "200", unit: "g" },
        { name: "Sugar", quantity: "150", unit: "g" },
        { name: "Butter", quantity: "80", unit: "g", notes: "melted" },
        { name: "Eggs", quantity: "2", unit: null },
        { name: "Baking soda", quantity: "1", unit: "tsp" },
        { name: "Salt", quantity: "1/4", unit: "tsp" },
        { name: "Vanilla extract", quantity: "1", unit: "tsp" },
        { name: "Walnuts", quantity: "80", unit: "g", notes: "optional, chopped" },
      ],
      steps: [
        { instruction: "Preheat oven to 175°C (350°F). Grease a 9×5 inch loaf pan." },
        { instruction: "Mix mashed bananas with melted butter." },
        { instruction: "Stir in sugar, beaten eggs, and vanilla." },
        { instruction: "Add flour, baking soda, and salt. Mix until just combined — do not overmix." },
        { instruction: "Fold in walnuts if using." },
        { instruction: "Pour into prepared pan and bake 60–65 minutes until a toothpick comes out clean." },
        { instruction: "Cool in pan for 10 minutes, then turn out onto a wire rack." },
      ],
    },
    {
      title: "Mushroom Risotto",
      description:
        "Creamy, comforting risotto packed with mixed mushrooms and finished with parmesan.",
      prepTime: 10,
      cookTime: 35,
      servings: 4,
      difficulty: "medium",
      cuisine: "Italian",
      tags: ["risotto", "vegetarian", "comfort food"],
      isFavorite: false,
      ingredients: [
        { name: "Arborio rice", quantity: "300", unit: "g" },
        { name: "Mixed mushrooms", quantity: "400", unit: "g", notes: "sliced" },
        { name: "Onion", quantity: "1", unit: null, notes: "finely diced" },
        { name: "Garlic", quantity: "3", unit: "cloves" },
        { name: "Dry white wine", quantity: "150", unit: "ml" },
        { name: "Vegetable stock", quantity: "1.2", unit: "L", notes: "hot" },
        { name: "Parmesan", quantity: "80", unit: "g", notes: "grated" },
        { name: "Butter", quantity: "3", unit: "tbsp" },
        { name: "Olive oil", quantity: "2", unit: "tbsp" },
        { name: "Fresh thyme", quantity: "4", unit: "sprigs" },
        { name: "Salt and pepper", quantity: null, unit: null },
      ],
      steps: [
        { instruction: "Sauté mushrooms in 1 tbsp butter and olive oil until golden. Season and set aside." },
        { instruction: "In the same pan, soften onion in remaining butter, then add garlic and thyme." },
        { instruction: "Add rice and toast for 2 minutes, stirring constantly." },
        { instruction: "Pour in wine and stir until absorbed." },
        { instruction: "Add hot stock one ladle at a time, stirring until each addition is absorbed, about 20 minutes total." },
        { instruction: "Stir in mushrooms and parmesan. Season to taste." },
        { instruction: "Rest for 2 minutes off heat, then serve." },
      ],
    },
  ]

  const createdRecipes = []

  for (const recipe of recipeData) {
    const { ingredients: recipeIngredients, steps: recipeSteps, ...recipeFields } = recipe

    const [created] = await db
      .insert(recipes)
      .values({
        householdId: household.id,
        createdById: user.id,
        ...recipeFields,
      })
      .returning()

    createdRecipes.push(created)

    if (recipeIngredients.length > 0) {
      await db.insert(ingredients).values(
        recipeIngredients.map((ing, idx) => ({
          recipeId: created.id,
          name: ing.name,
          quantity: ing.quantity ?? null,
          unit: ing.unit ?? null,
          notes: (ing as any).notes ?? null,
          orderIndex: idx,
        })),
      )
    }

    if (recipeSteps.length > 0) {
      await db.insert(steps).values(
        recipeSteps.map((step, idx) => ({
          recipeId: created.id,
          stepNumber: idx + 1,
          instruction: step.instruction,
        })),
      )
    }

    console.log("Created recipe:", created.title)
  }

  // Collections
  const [weeknightCollection] = await db
    .insert(collections)
    .values({
      householdId: household.id,
      createdById: user.id,
      name: "Weeknight Dinners",
      description: "Quick and easy meals for busy weeknights",
    })
    .returning()

  const [italianCollection] = await db
    .insert(collections)
    .values({
      householdId: household.id,
      createdById: user.id,
      name: "Italian Classics",
      description: "Traditional Italian recipes we love",
    })
    .returning()

  // Assign recipes to collections
  const carbonara = createdRecipes.find((r) => r.title === "Spaghetti Carbonara")!
  const tikka = createdRecipes.find((r) => r.title === "Chicken Tikka Masala")!
  const risotto = createdRecipes.find((r) => r.title === "Mushroom Risotto")!

  await db.insert(collectionRecipes).values([
    { collectionId: weeknightCollection.id, recipeId: tikka.id },
    { collectionId: weeknightCollection.id, recipeId: carbonara.id },
    { collectionId: italianCollection.id, recipeId: carbonara.id },
    { collectionId: italianCollection.id, recipeId: risotto.id },
  ])

  console.log("Created collections with recipes")

  // Meal plan — this week
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  const addDays = (d: Date, n: number) => {
    const r = new Date(d)
    r.setDate(r.getDate() + n)
    return r
  }

  await db.insert(mealPlanEntries).values([
    {
      householdId: household.id,
      recipeId: carbonara.id,
      plannedDate: addDays(monday, 0),
      mealType: "dinner",
    },
    {
      householdId: household.id,
      recipeId: tikka.id,
      plannedDate: addDays(monday, 2),
      mealType: "dinner",
    },
    {
      householdId: household.id,
      recipeId: risotto.id,
      plannedDate: addDays(monday, 4),
      mealType: "dinner",
    },
  ])

  console.log("Created meal plan entries")

  // Cook log
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  await db.insert(cookLog).values([
    {
      householdId: household.id,
      recipeId: carbonara.id,
      cookedById: user.id,
      cookedAt: threeDaysAgo,
      rating: 5,
      notes: "Perfect every time. Used guanciale from the deli.",
      servings: 4,
    },
    {
      householdId: household.id,
      recipeId: tikka.id,
      cookedById: user.id,
      cookedAt: yesterday,
      rating: 4,
      notes: "Really good! Added a bit more chilli next time.",
      servings: 4,
    },
  ])

  console.log("Created cook log entries")
  console.log("✓ Seed complete")
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
