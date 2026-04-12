import { createFileRoute, Link } from "@tanstack/react-router"
import { ClockIcon, UsersIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { listRecipes } from "@/server/functions/recipes"

export const Route = createFileRoute("/_app/recent")({
  component: RecentPage,
  loader: () => listRecipes({ data: {} }),
})

function RecentPage() {
  const recipes = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recent</h1>
        <p className="text-muted-foreground">Recently updated recipes</p>
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <ClockIcon className="size-8 text-muted-foreground" />
            <p className="font-medium">No recipes yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first recipe to see it here
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
                  <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
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
                  <span className="ml-auto">
                    {new Date(recipe.updatedAt).toLocaleDateString()}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
