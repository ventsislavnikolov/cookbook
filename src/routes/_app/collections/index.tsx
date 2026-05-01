import * as React from "react"
import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import { FolderOpenIcon, PlusIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  type CollectionListItem,
} from "@/server/functions/collections"
import { CollectionsSkeleton } from "@/components/skeletons/collections"

export const Route = createFileRoute("/_app/collections/")({
  component: CollectionsIndex,
  pendingComponent: CollectionsSkeleton,
  loader: () => getCollections(),
})

type FormState = { name: string; description: string }
const EMPTY: FormState = { name: "", description: "" }

function CollectionsIndex() {
  const collections = Route.useLoaderData()
  const router = useRouter()

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<CollectionListItem | null>(null)
  const [form, setForm] = React.useState<FormState>(EMPTY)
  const [submitting, setSubmitting] = React.useState(false)

  function openCreate() {
    setForm(EMPTY)
    setCreateOpen(true)
  }

  function openEdit(col: CollectionListItem) {
    setForm({ name: col.name, description: col.description ?? "" })
    setEditTarget(col)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createCollection({ data: { name: form.name, description: form.description || null } })
      await router.invalidate()
      setCreateOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setSubmitting(true)
    try {
      await updateCollection({
        data: { id: editTarget.id, name: form.name, description: form.description || null },
      })
      await router.invalidate()
      setEditTarget(null)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    await deleteCollection({ data: id })
    await router.invalidate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">
            {collections.length} {collections.length === 1 ? "collection" : "collections"}
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="size-4" />
          New Collection
        </Button>
      </div>

      {collections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <FolderOpenIcon className="size-8 text-muted-foreground" />
            <p className="font-medium">No collections yet</p>
            <p className="text-sm text-muted-foreground">
              Group your recipes into collections for easy access
            </p>
            <Button className="mt-2" onClick={openCreate}>
              <PlusIcon className="size-4" />
              New Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <div key={col.id} className="group relative">
              <Link
                to="/collections/$collectionId"
                params={{ collectionId: String(col.id) }}
                className="block transition-transform hover:-translate-y-0.5"
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-1">{col.name}</CardTitle>
                    {col.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {col.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {col.recipeCount} {col.recipeCount === 1 ? "recipe" : "recipes"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
              <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 bg-background shadow-sm"
                  onClick={(e) => {
                    e.preventDefault()
                    openEdit(col)
                  }}
                >
                  <PencilIcon className="size-3.5" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 bg-background shadow-sm"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{col.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        The collection will be deleted. Recipes inside it will not
                        be affected.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(col.id)}
                        render={<Button variant="destructive">Delete</Button>}
                      />
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Collection</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Name</p>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Weeknight dinners"
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Description</p>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional"
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !form.name.trim()}>
                {submitting ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Name</p>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Description</p>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || !form.name.trim()}>
                {submitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
