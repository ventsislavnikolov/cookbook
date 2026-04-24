import * as React from "react"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { Trash2Icon, RotateCcwIcon, AlertTriangleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { listRecipes, restoreRecipe, purgeRecipe } from "@/server/functions/recipes"

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export const Route = createFileRoute("/_app/trash")({
  component: TrashPage,
  loader: () => listRecipes({ data: { deletedOnly: true } }),
})

function TrashPage() {
  const recipes = Route.useLoaderData()
  const router = useRouter()
  const [actionId, setActionId] = React.useState<number | null>(null)

  async function handleRestore(id: number) {
    setActionId(id)
    try {
      await restoreRecipe({ data: id })
      await router.invalidate()
    } finally {
      setActionId(null)
    }
  }

  async function handlePurge(id: number) {
    setActionId(id)
    try {
      await purgeRecipe({ data: id })
      await router.invalidate()
    } finally {
      setActionId(null)
    }
  }

  const expiringSoon = recipes.filter(
    (r) => r.deletedAt && Date.now() - new Date(r.deletedAt).getTime() > THIRTY_DAYS_MS * 0.8,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trash</h1>
        <p className="text-muted-foreground">
          {recipes.length} deleted {recipes.length === 1 ? "recipe" : "recipes"}
        </p>
      </div>

      {expiringSoon.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
          <p>
            {expiringSoon.length}{" "}
            {expiringSoon.length === 1 ? "recipe is" : "recipes are"} approaching
            the 30-day limit and will be permanently deleted soon.
          </p>
        </div>
      )}

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Trash2Icon className="size-8 text-muted-foreground" />
            <p className="font-medium">Trash is empty</p>
            <p className="text-sm text-muted-foreground">
              Deleted recipes appear here for 30 days before permanent removal
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => {
            const deletedAt = recipe.deletedAt ? new Date(recipe.deletedAt) : null
            const daysAgo = deletedAt
              ? Math.floor((Date.now() - deletedAt.getTime()) / 86400000)
              : null
            const daysLeft = daysAgo != null ? 30 - daysAgo : null
            const isExpiring = daysLeft != null && daysLeft <= 6

            return (
              <Card key={recipe.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="line-clamp-1 text-base">
                        {recipe.title}
                      </CardTitle>
                      {deletedAt && (
                        <p
                          className={`mt-1 text-xs ${isExpiring ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          Deleted {daysAgo === 0 ? "today" : `${daysAgo}d ago`}
                          {daysLeft != null &&
                            ` · ${daysLeft}d until permanent deletion`}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionId === recipe.id}
                        onClick={() => handleRestore(recipe.id)}
                      >
                        <RotateCcwIcon className="size-3.5" />
                        Restore
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actionId === recipe.id}
                            >
                              <Trash2Icon className="size-3.5" />
                              Delete permanently
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete permanently?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              "{recipe.title}" will be permanently deleted and
                              cannot be recovered.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handlePurge(recipe.id)}
                            >
                              Delete permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
