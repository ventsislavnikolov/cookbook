import * as React from "react"
import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { PlusIcon, ClockIcon, UsersIcon, HeartIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { listRecipes, toggleFavorite } from "@/server/functions/recipes"

export const Route = createFileRoute("/_app/recipes/")({
  component: RecipesIndex,
  loader: () => listRecipes({ data: {} }),
})

function RecipesIndex() {
  const recipes = Route.useLoaderData()
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [cuisine, setCuisine] = React.useState("")
  const [difficulty, setDifficulty] = React.useState("")
  const [favoritesOnly, setFavoritesOnly] = React.useState(false)

  const filtered = recipes.filter((r) => {
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (cuisine && r.cuisine !== cuisine) return false
    if (difficulty && r.difficulty !== difficulty) return false
    if (favoritesOnly && !r.isFavorite) return false
    return true
  })

  const cuisines = [...new Set(recipes.map((r) => r.cuisine).filter(Boolean))]
  const difficulties = [...new Set(recipes.map((r) => r.difficulty).filter(Boolean))]

  async function handleToggleFavorite(e: React.MouseEvent, id: number) {
    e.preventDefault()
    await toggleFavorite({ data: id })
    await router.invalidate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recipes</h1>
          <p className="text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
            {recipes.length !== filtered.length && ` of ${recipes.length}`}
          </p>
        </div>
        <Button render={<Link to="/recipes/new" />}>
          <PlusIcon className="size-4" />
          New Recipe
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search recipes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {cuisines.length > 0 && (
          <Select value={cuisine} onValueChange={(v) => setCuisine(v ?? "")}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Cuisine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All cuisines</SelectItem>
              {cuisines.map((c) => (
                <SelectItem key={c} value={c!}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {difficulties.length > 0 && (
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v ?? "")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Button
          variant={favoritesOnly ? "default" : "outline"}
          size="icon"
          onClick={() => setFavoritesOnly((v) => !v)}
          title="Favorites only"
        >
          <HeartIcon className="size-4" />
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-muted-foreground">
              {recipes.length === 0
                ? "No recipes yet. Start by adding your first one."
                : "No recipes match your filters."}
            </p>
            {recipes.length === 0 && (
              <Button render={<Link to="/recipes/new" />}>
                <PlusIcon className="size-4" />
                New Recipe
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
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
                      className="shrink-0 text-muted-foreground transition-colors hover:text-red-500"
                      title={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      <HeartIcon
                        className={`size-4 ${recipe.isFavorite ? "fill-red-500 text-red-500" : ""}`}
                      />
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
