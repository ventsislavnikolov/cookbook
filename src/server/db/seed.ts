import "dotenv/config"
import { sql as drizzleSql } from "drizzle-orm"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"
import {
  households,
  userProfiles,
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

type IngredientSeed = {
  name: string
  quantity: string | null
  unit: string | null
  notes?: string | null
}

type RecipeSeed = {
  title: string
  description: string
  prepTime: number
  cookTime: number
  servings: number
  difficulty: "easy" | "medium" | "hard"
  cuisine: string
  tags: string[]
  isFavorite: boolean
  trashedDaysAgo?: number
  ingredients: IngredientSeed[]
  steps: { instruction: string }[]
}

const recipeData: RecipeSeed[] = [
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
  {
    title: "Fluffy Buttermilk Pancakes",
    description:
      "Tall, tender pancakes that puff up on the griddle. Weekend breakfast staple.",
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: "easy",
    cuisine: "American",
    tags: ["breakfast", "vegetarian", "quick"],
    isFavorite: true,
    ingredients: [
      { name: "Plain flour", quantity: "250", unit: "g" },
      { name: "Buttermilk", quantity: "300", unit: "ml" },
      { name: "Eggs", quantity: "2", unit: null },
      { name: "Sugar", quantity: "2", unit: "tbsp" },
      { name: "Baking powder", quantity: "2", unit: "tsp" },
      { name: "Baking soda", quantity: "1/2", unit: "tsp" },
      { name: "Salt", quantity: "1/2", unit: "tsp" },
      { name: "Melted butter", quantity: "60", unit: "g" },
    ],
    steps: [
      { instruction: "Whisk dry ingredients in a large bowl." },
      { instruction: "Whisk buttermilk, eggs, and melted butter in a separate bowl." },
      { instruction: "Pour wet into dry and stir gently — leave lumps." },
      { instruction: "Cook 1/4 cup portions on a buttered griddle over medium heat until bubbles pop, then flip." },
      { instruction: "Serve with maple syrup and butter." },
    ],
  },
  {
    title: "Margherita Pizza",
    description:
      "Crisp-edged Neapolitan-style pizza with San Marzano tomatoes, fresh mozzarella, and basil.",
    prepTime: 30,
    cookTime: 12,
    servings: 2,
    difficulty: "medium",
    cuisine: "Italian",
    tags: ["pizza", "vegetarian", "weekend"],
    isFavorite: true,
    ingredients: [
      { name: "Pizza dough", quantity: "1", unit: "ball", notes: "250g, room temperature" },
      { name: "San Marzano tomatoes", quantity: "200", unit: "g", notes: "crushed by hand" },
      { name: "Fresh mozzarella", quantity: "125", unit: "g", notes: "torn" },
      { name: "Fresh basil", quantity: null, unit: null, notes: "small handful" },
      { name: "Olive oil", quantity: "1", unit: "tbsp" },
      { name: "Sea salt", quantity: null, unit: null },
    ],
    steps: [
      { instruction: "Preheat oven and pizza stone to 260°C (500°F) for 30 minutes." },
      { instruction: "Stretch dough into a 30cm round on a floured peel." },
      { instruction: "Spread tomatoes, leaving a border. Top with torn mozzarella and a pinch of salt." },
      { instruction: "Slide onto stone and bake 10–12 minutes until crust is blistered." },
      { instruction: "Finish with fresh basil and a drizzle of olive oil." },
    ],
  },
  {
    title: "Thai Green Curry",
    description:
      "Aromatic green curry with chicken, Thai basil, and coconut milk. Ready in 30 minutes.",
    prepTime: 10,
    cookTime: 20,
    servings: 4,
    difficulty: "easy",
    cuisine: "Thai",
    tags: ["curry", "weeknight", "spicy"],
    isFavorite: false,
    ingredients: [
      { name: "Chicken thigh", quantity: "600", unit: "g", notes: "sliced" },
      { name: "Green curry paste", quantity: "3", unit: "tbsp" },
      { name: "Coconut milk", quantity: "400", unit: "ml" },
      { name: "Fish sauce", quantity: "1", unit: "tbsp" },
      { name: "Palm sugar", quantity: "1", unit: "tsp" },
      { name: "Thai aubergines", quantity: "150", unit: "g", notes: "quartered" },
      { name: "Thai basil", quantity: null, unit: null, notes: "small handful" },
      { name: "Lime", quantity: "1", unit: null },
    ],
    steps: [
      { instruction: "Fry curry paste in a splash of coconut cream until fragrant." },
      { instruction: "Add chicken and stir to coat. Cook for 3 minutes." },
      { instruction: "Pour in remaining coconut milk, fish sauce, and sugar. Simmer 10 minutes." },
      { instruction: "Add aubergines and cook 5 minutes more." },
      { instruction: "Stir through basil, finish with lime juice, and serve with jasmine rice." },
    ],
  },
  {
    title: "Avocado Toast with Egg",
    description:
      "Smashed avocado on sourdough topped with a soft-poached egg and chilli flakes.",
    prepTime: 5,
    cookTime: 5,
    servings: 1,
    difficulty: "easy",
    cuisine: "American",
    tags: ["breakfast", "quick", "vegetarian"],
    isFavorite: true,
    ingredients: [
      { name: "Sourdough", quantity: "2", unit: "slices" },
      { name: "Ripe avocado", quantity: "1", unit: null },
      { name: "Egg", quantity: "1", unit: null },
      { name: "Lemon juice", quantity: "1", unit: "tsp" },
      { name: "Chilli flakes", quantity: null, unit: null },
      { name: "Sea salt", quantity: null, unit: null },
      { name: "Olive oil", quantity: null, unit: null },
    ],
    steps: [
      { instruction: "Toast sourdough until golden." },
      { instruction: "Smash avocado with lemon juice and a pinch of salt." },
      { instruction: "Poach egg in simmering vinegar water for 3 minutes." },
      { instruction: "Spread avocado on toast, top with egg, finish with chilli flakes and olive oil." },
    ],
  },
  {
    title: "Beef Bourguignon",
    description:
      "Slow-braised beef in red wine with bacon, mushrooms, and pearl onions. Worth the wait.",
    prepTime: 30,
    cookTime: 180,
    servings: 6,
    difficulty: "hard",
    cuisine: "French",
    tags: ["beef", "comfort food", "weekend"],
    isFavorite: false,
    ingredients: [
      { name: "Beef chuck", quantity: "1.2", unit: "kg", notes: "cut into 4cm cubes" },
      { name: "Smoked bacon", quantity: "150", unit: "g", notes: "diced" },
      { name: "Red wine", quantity: "750", unit: "ml", notes: "Burgundy preferred" },
      { name: "Beef stock", quantity: "300", unit: "ml" },
      { name: "Pearl onions", quantity: "250", unit: "g" },
      { name: "Button mushrooms", quantity: "300", unit: "g" },
      { name: "Carrots", quantity: "2", unit: null, notes: "sliced" },
      { name: "Garlic", quantity: "4", unit: "cloves" },
      { name: "Tomato paste", quantity: "2", unit: "tbsp" },
      { name: "Plain flour", quantity: "2", unit: "tbsp" },
      { name: "Bay leaves", quantity: "2", unit: null },
      { name: "Fresh thyme", quantity: "4", unit: "sprigs" },
    ],
    steps: [
      { instruction: "Render bacon in a Dutch oven. Remove and reserve, leaving the fat." },
      { instruction: "Pat beef dry, season, and brown in batches in the bacon fat. Set aside." },
      { instruction: "Soften carrots and garlic, stir in tomato paste and flour." },
      { instruction: "Deglaze with wine, scraping the fond. Add stock, bay, thyme, beef, and bacon." },
      { instruction: "Braise in a 160°C (325°F) oven for 2.5 hours until fork-tender." },
      { instruction: "Sauté pearl onions and mushrooms separately until golden, then stir in for the final 20 minutes." },
      { instruction: "Skim fat, adjust seasoning, and serve with mashed potatoes." },
    ],
  },
  {
    title: "Greek Salad",
    description:
      "Crisp tomatoes, cucumber, olives, and feta with oregano and a punchy olive oil dressing.",
    prepTime: 10,
    cookTime: 0,
    servings: 4,
    difficulty: "easy",
    cuisine: "Greek",
    tags: ["salad", "vegetarian", "quick", "light"],
    isFavorite: false,
    ingredients: [
      { name: "Tomatoes", quantity: "4", unit: "large", notes: "cut into wedges" },
      { name: "Cucumber", quantity: "1", unit: null },
      { name: "Red onion", quantity: "1/2", unit: null, notes: "thinly sliced" },
      { name: "Kalamata olives", quantity: "100", unit: "g" },
      { name: "Feta", quantity: "200", unit: "g", notes: "in a slab" },
      { name: "Dried oregano", quantity: "1", unit: "tsp" },
      { name: "Extra virgin olive oil", quantity: "4", unit: "tbsp" },
      { name: "Red wine vinegar", quantity: "1", unit: "tbsp" },
    ],
    steps: [
      { instruction: "Combine tomatoes, cucumber, onion, and olives in a wide bowl." },
      { instruction: "Lay feta on top in a single slab and sprinkle with oregano." },
      { instruction: "Drizzle generously with olive oil and a splash of vinegar. Serve immediately." },
    ],
  },
  {
    title: "Chocolate Chip Cookies",
    description:
      "Crisp at the edges, chewy in the middle, with puddles of dark chocolate.",
    prepTime: 15,
    cookTime: 12,
    servings: 18,
    difficulty: "easy",
    cuisine: "American",
    tags: ["dessert", "baking", "vegetarian"],
    isFavorite: true,
    ingredients: [
      { name: "Plain flour", quantity: "280", unit: "g" },
      { name: "Brown sugar", quantity: "200", unit: "g" },
      { name: "White sugar", quantity: "100", unit: "g" },
      { name: "Butter", quantity: "230", unit: "g", notes: "softened" },
      { name: "Eggs", quantity: "2", unit: null },
      { name: "Vanilla extract", quantity: "2", unit: "tsp" },
      { name: "Baking soda", quantity: "1", unit: "tsp" },
      { name: "Salt", quantity: "1", unit: "tsp" },
      { name: "Dark chocolate", quantity: "300", unit: "g", notes: "roughly chopped" },
    ],
    steps: [
      { instruction: "Cream butter and sugars until light and fluffy." },
      { instruction: "Beat in eggs one at a time, then vanilla." },
      { instruction: "Stir in flour, baking soda, and salt until just combined." },
      { instruction: "Fold in chocolate. Chill dough for at least 30 minutes." },
      { instruction: "Scoop onto lined trays and bake at 180°C (350°F) for 11–13 minutes." },
      { instruction: "Cool on tray for 5 minutes before transferring." },
    ],
  },
  {
    title: "Tomato Basil Soup",
    description:
      "Velvety roasted tomato soup finished with cream and torn basil.",
    prepTime: 10,
    cookTime: 45,
    servings: 4,
    difficulty: "easy",
    cuisine: "American",
    tags: ["soup", "vegetarian", "comfort food"],
    isFavorite: false,
    trashedDaysAgo: 2,
    ingredients: [
      { name: "Plum tomatoes", quantity: "1", unit: "kg", notes: "halved" },
      { name: "Onion", quantity: "1", unit: null, notes: "quartered" },
      { name: "Garlic", quantity: "4", unit: "cloves" },
      { name: "Olive oil", quantity: "3", unit: "tbsp" },
      { name: "Vegetable stock", quantity: "500", unit: "ml" },
      { name: "Heavy cream", quantity: "100", unit: "ml" },
      { name: "Fresh basil", quantity: null, unit: null },
    ],
    steps: [
      { instruction: "Roast tomatoes, onion, and garlic with olive oil at 200°C (400°F) for 35 minutes." },
      { instruction: "Blend with stock until smooth." },
      { instruction: "Reheat with cream, season, and finish with torn basil." },
    ],
  },
  {
    title: "Quinoa Bowl Experiment",
    description:
      "First attempt was bland. Keeping the file but moving on.",
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    difficulty: "easy",
    cuisine: "American",
    tags: ["bowl", "vegetarian", "experiment"],
    isFavorite: false,
    trashedDaysAgo: 9,
    ingredients: [
      { name: "Quinoa", quantity: "150", unit: "g" },
      { name: "Roasted vegetables", quantity: "300", unit: "g" },
      { name: "Tahini dressing", quantity: "3", unit: "tbsp" },
    ],
    steps: [
      { instruction: "Cook quinoa per packet instructions." },
      { instruction: "Top with roasted vegetables and tahini dressing." },
    ],
  },
]

async function seed() {
  if (RESET) {
    console.log("Resetting database…")
    await db.execute(drizzleSql`
      TRUNCATE cook_log, meal_plan_entries, collection_recipes,
        collections, steps, ingredients, recipes,
        user_profiles, households
      RESTART IDENTITY CASCADE
    `)
    console.log("Tables truncated.")
  }

  console.log("Seeding database…")

  const createdHouseholds = await db
    .insert(households)
    .values([
      { name: "The Nikolov Kitchen" },
      { name: "The Petrov Family" },
      { name: "Shared Flat 4B" },
      { name: "Weekend Cottage" },
    ])
    .returning()

  const household = createdHouseholds[0]
  console.log("Created households:", createdHouseholds.length)

  const seedUserId = process.env.SEED_USER_ID
  if (!seedUserId) {
    throw new Error(
      'SEED_USER_ID is required. Sign up via the app UI once, then copy the id from neon_auth."user".',
    )
  }

  const [profile] = await db
    .insert(userProfiles)
    .values({
      userId: seedUserId,
      householdId: household.id,
    })
    .returning()

  console.log("Created profile for user:", profile.userId)
  const user = { id: seedUserId }

  const daysAgo = (n: number) => {
    const d = new Date()
    d.setDate(d.getDate() - n)
    return d
  }

  const createdRecipes: { id: number; title: string }[] = []

  for (const recipe of recipeData) {
    const { ingredients: recipeIngredients, steps: recipeSteps, trashedDaysAgo, ...recipeFields } =
      recipe

    const [created] = await db
      .insert(recipes)
      .values({
        householdId: household.id,
        createdById: user.id,
        ...recipeFields,
        deletedAt: trashedDaysAgo != null ? daysAgo(trashedDaysAgo) : null,
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
          notes: ing.notes ?? null,
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

  const byTitle = (title: string) => {
    const r = createdRecipes.find((x) => x.title === title)
    if (!r) throw new Error(`Recipe not found: ${title}`)
    return r
  }

  const carbonara = byTitle("Spaghetti Carbonara")
  const tikka = byTitle("Chicken Tikka Masala")
  const risotto = byTitle("Mushroom Risotto")
  const salad = byTitle("Simple Green Salad")
  const bananaBread = byTitle("Banana Bread")
  const pancakes = byTitle("Fluffy Buttermilk Pancakes")
  const pizza = byTitle("Margherita Pizza")
  const thaiCurry = byTitle("Thai Green Curry")
  const avocadoToast = byTitle("Avocado Toast with Egg")
  const bourguignon = byTitle("Beef Bourguignon")
  const greekSalad = byTitle("Greek Salad")
  const cookies = byTitle("Chocolate Chip Cookies")

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

  const [vegetarianCollection] = await db
    .insert(collections)
    .values({
      householdId: household.id,
      createdById: user.id,
      name: "Vegetarian Favourites",
      description: "Meat-free meals worth making again",
    })
    .returning()

  const [bakingCollection] = await db
    .insert(collections)
    .values({
      householdId: household.id,
      createdById: user.id,
      name: "Baking & Sweets",
      description: "Sweet treats and baked goods",
    })
    .returning()

  const [breakfastCollection] = await db
    .insert(collections)
    .values({
      householdId: household.id,
      createdById: user.id,
      name: "Breakfast Ideas",
      description: "Morning fuel for slow weekends and busy weekdays",
    })
    .returning()

  await db.insert(collectionRecipes).values([
    { collectionId: weeknightCollection.id, recipeId: tikka.id },
    { collectionId: weeknightCollection.id, recipeId: carbonara.id },
    { collectionId: weeknightCollection.id, recipeId: thaiCurry.id },
    { collectionId: italianCollection.id, recipeId: carbonara.id },
    { collectionId: italianCollection.id, recipeId: risotto.id },
    { collectionId: italianCollection.id, recipeId: pizza.id },
    { collectionId: vegetarianCollection.id, recipeId: risotto.id },
    { collectionId: vegetarianCollection.id, recipeId: salad.id },
    { collectionId: vegetarianCollection.id, recipeId: bananaBread.id },
    { collectionId: vegetarianCollection.id, recipeId: greekSalad.id },
    { collectionId: vegetarianCollection.id, recipeId: pizza.id },
    { collectionId: bakingCollection.id, recipeId: bananaBread.id },
    { collectionId: bakingCollection.id, recipeId: cookies.id },
    { collectionId: breakfastCollection.id, recipeId: pancakes.id },
    { collectionId: breakfastCollection.id, recipeId: avocadoToast.id },
    { collectionId: breakfastCollection.id, recipeId: bananaBread.id },
  ])

  console.log("Created collections with recipes")

  // Meal plan — current and next week, with today populated
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

  const mealPlan = [
    // Today — covers Dashboard "today's plan"
    { recipeId: avocadoToast.id, plannedDate: today, mealType: "breakfast", servings: 1 },
    { recipeId: greekSalad.id, plannedDate: today, mealType: "lunch", servings: 2 },
    { recipeId: thaiCurry.id, plannedDate: today, mealType: "dinner", servings: 4 },
    // Rest of week
    { recipeId: pancakes.id, plannedDate: addDays(monday, 0), mealType: "breakfast", servings: 4 },
    { recipeId: carbonara.id, plannedDate: addDays(monday, 0), mealType: "dinner", servings: 4 },
    { recipeId: salad.id, plannedDate: addDays(monday, 1), mealType: "lunch", servings: 2 },
    { recipeId: tikka.id, plannedDate: addDays(monday, 2), mealType: "dinner", servings: 4 },
    { recipeId: risotto.id, plannedDate: addDays(monday, 4), mealType: "dinner", servings: 4 },
    { recipeId: pizza.id, plannedDate: addDays(monday, 5), mealType: "dinner", servings: 2 },
    { recipeId: bourguignon.id, plannedDate: addDays(monday, 6), mealType: "dinner", servings: 6 },
    // Next week preview
    { recipeId: pancakes.id, plannedDate: addDays(monday, 7), mealType: "breakfast", servings: 4 },
    { recipeId: thaiCurry.id, plannedDate: addDays(monday, 9), mealType: "dinner", servings: 4 },
  ]

  await db
    .insert(mealPlanEntries)
    .values(
      mealPlan.map((entry) => ({
        householdId: household.id,
        recipeId: entry.recipeId,
        plannedDate: entry.plannedDate,
        mealType: entry.mealType,
        servings: entry.servings,
      })),
    )

  console.log("Created meal plan entries:", mealPlan.length)

  // Cook log — today, yesterday, and spread across last month for streak + recent
  const cookEntries = [
    { recipeId: avocadoToast.id, cookedAt: new Date(), rating: 5, notes: "Perfect ripe avocado today.", servings: 1 },
    { recipeId: pancakes.id, cookedAt: daysAgo(1), rating: 5, notes: "Tallest stack yet.", servings: 4 },
    { recipeId: thaiCurry.id, cookedAt: daysAgo(2), rating: 4, notes: "Used homemade paste.", servings: 4 },
    { recipeId: greekSalad.id, cookedAt: daysAgo(3), rating: 5, notes: "Best with sun-warm tomatoes.", servings: 4 },
    { recipeId: tikka.id, cookedAt: daysAgo(4), rating: 4, notes: "Marinated overnight — worth it.", servings: 4 },
    { recipeId: pizza.id, cookedAt: daysAgo(6), rating: 5, notes: "Stone preheated for an hour.", servings: 2 },
    { recipeId: cookies.id, cookedAt: daysAgo(8), rating: 5, notes: "Chilled dough for 24h.", servings: 18 },
    { recipeId: risotto.id, cookedAt: daysAgo(10), rating: 5, notes: "Mixed chestnut and chanterelle — excellent.", servings: 4 },
    { recipeId: bananaBread.id, cookedAt: daysAgo(13), rating: 4, notes: "Added walnuts.", servings: 8 },
    { recipeId: carbonara.id, cookedAt: daysAgo(16), rating: 5, notes: "Perfect every time.", servings: 4 },
    { recipeId: bourguignon.id, cookedAt: daysAgo(21), rating: 5, notes: "Three hours well spent.", servings: 6 },
    { recipeId: tikka.id, cookedAt: daysAgo(25), rating: 4, notes: "More chilli next time.", servings: 4 },
  ]

  await db.insert(cookLog).values(
    cookEntries.map((entry) => ({
      householdId: household.id,
      recipeId: entry.recipeId,
      cookedById: user.id,
      cookedAt: entry.cookedAt,
      rating: entry.rating,
      notes: entry.notes,
      servings: entry.servings,
    })),
  )

  console.log("Created cook log entries:", cookEntries.length)
  console.log("✓ Seed complete")
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
