import * as React from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  RecipeForm,
  emptyRecipeForm,
  toServerPayload,
  type RecipeFormValues,
} from "@/components/recipe-form"
import { createRecipe } from "@/server/functions/recipes"

export const Route = createFileRoute("/_app/recipes/new")({
  component: NewRecipePage,
})

function NewRecipePage() {
  const navigate = useNavigate()
  const [values, setValues] = React.useState<RecipeFormValues>(emptyRecipeForm)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const recipe = await createRecipe({ data: toServerPayload(values) })
      navigate({
        to: "/recipes/$recipeId",
        params: { recipeId: String(recipe.id) },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recipe")
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" render={<Link to="/recipes" />}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">New Recipe</h1>
      </div>
      <RecipeForm
        values={values}
        onChange={setValues}
        onSubmit={handleSubmit}
        submitLabel="Create recipe"
        submitting={submitting}
        error={error}
        onCancel={() => navigate({ to: "/recipes" })}
      />
    </div>
  )
}
