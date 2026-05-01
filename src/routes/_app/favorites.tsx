import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { HeartIcon, ClockIcon, UsersIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RecipeGridSkeleton } from "@/components/skeletons/recipe-grid"
import { listRecipes, toggleFavorite } from "@/server/functions/recipes"

export const Route = createFileRoute("/_app/favorites")({
  component: FavoritesPage,
  pendingComponent: () => <RecipeGridSkeleton showAction={false} showFilters={false} />,
  loader: () => listRecipes({ data: { favoritesOnly: true } }),
})

function FavoritesPage() {
  const recipes = Route.useLoaderData()
  const router = useRouter()

  async function handleToggleFavorite(e: React.MouseEvent, id: number) {
    e.preventDefault()
    await toggleFavorite({ data: id })
    await router.invalidate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
        <p className="text-muted-foreground">
          {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
        </p>
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <HeartIcon className="size-8 text-muted-foreground" />
            <p className="font-medium">No favorite recipes yet</p>
            <p className="text-sm text-muted-foreground">
              Click the heart icon on a recipe to add it here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Link
              key={recipe.id}
              to="/recipes/$recipeId"
              params={{ recipeId: String(recipe.id) }}
              className="transition-transform hover:-translate-y-0.5"
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(e, recipe.id)}
                      className="shrink-0 text-primary transition-colors hover:text-muted-foreground"
                      title="Remove from favorites"
                    >
                      <HeartIcon className="size-4 fill-current" />
                    </button>
                  </div>
                  {recipe.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {recipe.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {recipe.prepTime != null && (
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="size-3" />
                      {recipe.prepTime + (recipe.cookTime ?? 0)} min
                    </span>
                  )}
                  {recipe.servings != null && (
                    <span className="inline-flex items-center gap-1">
                      <UsersIcon className="size-3" />
                      {recipe.servings}
                    </span>
                  )}
                  {recipe.cuisine && (
                    <Badge variant="secondary">{recipe.cuisine}</Badge>
                  )}
                  {recipe.difficulty && (
                    <Badge variant="outline">{recipe.difficulty}</Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
