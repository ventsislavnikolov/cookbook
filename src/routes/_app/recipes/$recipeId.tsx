import * as React from "react"
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router"
import {
  ArrowLeftIcon,
  ChefHatIcon,
  ClockIcon,
  HeartIcon,
  PencilIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  RecipeForm,
  toServerPayload,
  type RecipeFormValues,
} from "@/components/recipe-form"
import {
  deleteRecipe,
  getRecipe,
  toggleFavorite,
  updateRecipe,
  type RecipeDetail,
} from "@/server/functions/recipes"
import { logCook } from "@/server/functions/cook-log"

export const Route = createFileRoute("/_app/recipes/$recipeId")({
  component: RecipeDetailPage,
  loader: ({ params }) => getRecipe({ data: Number(params.recipeId) }),
})

function recipeToFormValues(recipe: RecipeDetail): RecipeFormValues {
  return {
    title: recipe.title,
    description: recipe.description ?? "",
    prepTime: recipe.prepTime?.toString() ?? "",
    cookTime: recipe.cookTime?.toString() ?? "",
    servings: recipe.servings?.toString() ?? "",
    difficulty: recipe.difficulty ?? "",
    cuisine: recipe.cuisine ?? "",
    tags: recipe.tags?.join(", ") ?? "",
    ingredients:
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((i) => ({
            name: i.name,
            quantity: i.quantity ?? "",
            unit: i.unit ?? "",
            notes: i.notes ?? "",
          }))
        : [{ name: "", quantity: "", unit: "", notes: "" }],
    steps:
      recipe.steps.length > 0
        ? recipe.steps.map((s) => ({
            instruction: s.instruction,
            duration: s.duration?.toString() ?? "",
          }))
        : [{ instruction: "", duration: "" }],
  }
}

function RecipeDetailPage() {
  const recipe = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const [editing, setEditing] = React.useState(false)
  const [values, setValues] = React.useState<RecipeFormValues>(() =>
    recipeToFormValues(recipe),
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [logging, setLogging] = React.useState(false)

  React.useEffect(() => {
    setValues(recipeToFormValues(recipe))
  }, [recipe])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await updateRecipe({
        data: { id: recipe.id, ...toServerPayload(values) },
      })
      await router.invalidate()
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save recipe")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteRecipe({ data: recipe.id })
      navigate({ to: "/recipes" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete recipe")
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Recipe</h1>
        <RecipeForm
          values={values}
          onChange={setValues}
          onSubmit={handleSave}
          submitLabel="Save changes"
          submitting={submitting}
          error={error}
          onCancel={() => {
            setValues(recipeToFormValues(recipe))
            setEditing(false)
          }}
        />
      </div>
    )
  }

  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <Button variant="ghost" size="icon" render={<Link to="/recipes" />}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="mt-1 text-muted-foreground">{recipe.description}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={logging}
            onClick={async () => {
              setLogging(true)
              try {
                await logCook({ data: { recipeId: recipe.id } })
                await router.invalidate()
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to log cook")
              } finally {
                setLogging(false)
              }
            }}
          >
            <ChefHatIcon className="size-4" />
            {logging ? "Logging…" : "I made this"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={async () => {
              await toggleFavorite({ data: recipe.id })
              await router.invalidate()
            }}
            title={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <HeartIcon
              className={`size-4 ${recipe.isFavorite ? "fill-primary text-primary" : ""}`}
            />
          </Button>
          <Button variant="outline" onClick={() => setEditing(true)}>
            <PencilIcon className="size-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline">
                  <Trash2Icon className="size-4" />
                  Delete
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this recipe?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The recipe and all its
                  ingredients and steps will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  render={
                    <Button variant="destructive">
                      {deleting ? "Deleting…" : "Delete"}
                    </Button>
                  }
                />
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        {totalTime > 0 && (
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-4" />
            {totalTime} min
          </span>
        )}
        {recipe.servings != null && (
          <span className="inline-flex items-center gap-1">
            <UsersIcon className="size-4" />
            {recipe.servings} servings
          </span>
        )}
        {recipe.cuisine && <Badge variant="secondary">{recipe.cuisine}</Badge>}
        {recipe.difficulty && (
          <Badge variant="outline">{recipe.difficulty}</Badge>
        )}
        {recipe.tags?.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            {recipe.ingredients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ingredients.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.id} className="flex gap-2">
                    {(ing.quantity || ing.unit) && (
                      <span className="font-medium text-muted-foreground">
                        {[ing.quantity, ing.unit].filter(Boolean).join(" ")}
                      </span>
                    )}
                    <span>{ing.name}</span>
                    {ing.notes && (
                      <span className="text-muted-foreground">
                        — {ing.notes}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Steps</CardTitle>
          </CardHeader>
          <CardContent>
            {recipe.steps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No steps recorded.
              </p>
            ) : (
              <ol className="space-y-4">
                {recipe.steps.map((step) => (
                  <li key={step.id} className="flex gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {step.stepNumber}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{step.instruction}</p>
                      {step.duration != null && (
                        <p className="text-xs text-muted-foreground">
                          {step.duration} min
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
