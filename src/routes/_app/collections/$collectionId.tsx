import * as React from "react"
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router"
import { ArrowLeftIcon, PlusIcon, Trash2Icon, BookOpenIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { getCollection, addToCollection, removeFromCollection } from "@/server/functions/collections"
import { listRecipes } from "@/server/functions/recipes"
import { CollectionDetailSkeleton } from "@/components/skeletons/collection-detail"

export const Route = createFileRoute("/_app/collections/$collectionId")({
  component: CollectionDetailPage,
  pendingComponent: CollectionDetailSkeleton,
  loader: ({ params }) => getCollection({ data: { id: Number(params.collectionId) } }),
})

function CollectionDetailPage() {
  const collection = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()

  const [addOpen, setAddOpen] = React.useState(false)
  const [allRecipes, setAllRecipes] = React.useState<Awaited<ReturnType<typeof listRecipes>>>([])
  const [search, setSearch] = React.useState("")
  const [adding, setAdding] = React.useState<number | null>(null)
  const [removing, setRemoving] = React.useState<number | null>(null)

  const collectionRecipeIds = new Set(collection.recipes.map((r) => r.id))

  async function openAddDialog() {
    const recipes = await listRecipes({ data: {} })
    setAllRecipes(recipes)
    setSearch("")
    setAddOpen(true)
  }

  async function handleAdd(recipeId: number) {
    setAdding(recipeId)
    try {
      await addToCollection({ data: { collectionId: collection.id, recipeId } })
      await router.invalidate()
    } finally {
      setAdding(null)
    }
  }

  async function handleRemove(recipeId: number) {
    setRemoving(recipeId)
    try {
      await removeFromCollection({ data: { collectionId: collection.id, recipeId } })
      await router.invalidate()
    } finally {
      setRemoving(null)
    }
  }

  const filteredAll = allRecipes.filter(
    (r) =>
      !collectionRecipeIds.has(r.id) &&
      (!search || r.title.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <Button variant="ghost" size="icon" render={<Link to="/collections" />}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{collection.name}</h1>
            {collection.description && (
              <p className="mt-1 text-muted-foreground">{collection.description}</p>
            )}
          </div>
        </div>
        <Button onClick={openAddDialog}>
          <PlusIcon className="size-4" />
          Add Recipe
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {collection.recipes.length} {collection.recipes.length === 1 ? "recipe" : "recipes"}
      </p>

      {collection.recipes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <BookOpenIcon className="size-8 text-muted-foreground" />
            <p className="font-medium">No recipes in this collection</p>
            <p className="text-sm text-muted-foreground">
              Add recipes to keep them organised together
            </p>
            <Button className="mt-2" onClick={openAddDialog}>
              <PlusIcon className="size-4" />
              Add Recipe
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {collection.recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <Link
                    to="/recipes/$recipeId"
                    params={{ recipeId: String(recipe.id) }}
                    className="min-w-0 flex-1 hover:underline"
                  >
                    <CardTitle className="line-clamp-1 text-base">{recipe.title}</CardTitle>
                    {recipe.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {recipe.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {recipe.cuisine && <Badge variant="secondary">{recipe.cuisine}</Badge>}
                      {recipe.difficulty && <Badge variant="outline">{recipe.difficulty}</Badge>}
                    </div>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                          disabled={removing === recipe.id}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      }
                    />
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove from collection?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{recipe.title}" will be removed from this collection. The recipe itself
                          will not be deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemove(recipe.id)}
                          render={<Button variant="destructive">Remove</Button>}
                        />
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Add recipe dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Recipe</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search recipes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 min-h-0 py-1">
            {filteredAll.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {allRecipes.length === collectionRecipeIds.size
                  ? "All recipes are already in this collection"
                  : "No recipes match your search"}
              </p>
            ) : (
              filteredAll.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{recipe.title}</p>
                    {recipe.cuisine && (
                      <p className="text-xs text-muted-foreground">{recipe.cuisine}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={adding === recipe.id}
                    onClick={() => handleAdd(recipe.id)}
                  >
                    {adding === recipe.id ? "Adding…" : "Add"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
