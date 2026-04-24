import * as React from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon, StarIcon, FlameIcon, SearchIcon } from "lucide-react"
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
  getCookLog,
  getCookingStreak,
  getWeeklyGoals,
  logCook,
  type CookLogEntry,
} from "@/server/functions/cook-log"
import { listRecipes } from "@/server/functions/recipes"

export const Route = createFileRoute("/_app/cook-log")({
  component: CookLogPage,
  loader: () =>
    Promise.all([getCookLog(), getCookingStreak(), getWeeklyGoals()]).then(
      ([entries, streak, goals]) => ({ entries, streak, goals }),
    ),
})

type LogForm = {
  recipeId: number | null
  recipeTitle: string
  rating: string
  notes: string
  servings: string
  cookedAt: string
}

const EMPTY_FORM: LogForm = {
  recipeId: null,
  recipeTitle: "",
  rating: "",
  notes: "",
  servings: "",
  cookedAt: new Date().toISOString().slice(0, 10),
}

function StarRating({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? null : n)}
          className={`transition-colors ${
            value !== null && n <= value
              ? "text-primary"
              : "text-muted-foreground hover:text-primary/70"
          }`}
        >
          <StarIcon
            className="size-5"
            fill={value !== null && n <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  )
}

function CookLogPage() {
  const { entries: initial, streak, goals } = Route.useLoaderData()
  const [entries, setEntries] = React.useState<CookLogEntry[]>(initial)

  const [logOpen, setLogOpen] = React.useState(false)
  const [form, setForm] = React.useState<LogForm>(EMPTY_FORM)
  const [allRecipes, setAllRecipes] = React.useState<Awaited<ReturnType<typeof listRecipes>>>([])
  const [search, setSearch] = React.useState("")
  const [step, setStep] = React.useState<"pick" | "details">("pick")
  const [submitting, setSubmitting] = React.useState(false)

  async function openLog() {
    const recipes = await listRecipes({ data: {} })
    setAllRecipes(recipes)
    setSearch("")
    setForm({ ...EMPTY_FORM, cookedAt: new Date().toISOString().slice(0, 10) })
    setStep("pick")
    setLogOpen(true)
  }

  function selectRecipe(id: number, title: string) {
    setForm((f) => ({ ...f, recipeId: id, recipeTitle: title }))
    setStep("details")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.recipeId) return
    setSubmitting(true)
    try {
      await logCook({
        data: {
          recipeId: form.recipeId,
          rating: form.rating ? Number(form.rating) : null,
          notes: form.notes || null,
          servings: form.servings ? Number(form.servings) : null,
          cookedAt: form.cookedAt ? new Date(form.cookedAt).toISOString() : null,
        },
      })
      const updated = await getCookLog()
      setEntries(updated)
      setLogOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredRecipes = allRecipes.filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase()),
  )

  const weeklyPct = Math.min(Math.round((goals.cookedCount / goals.target) * 100), 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cook Log</h1>
          <p className="text-muted-foreground">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <Button onClick={openLog}>
          <PlusIcon className="size-4" />
          Log Cook
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FlameIcon className="size-4 text-primary" />
              Cooking streak
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-2">
            <p className="text-3xl font-bold">{streak.streak}</p>
            <p className="mb-1 text-muted-foreground">{streak.streak === 1 ? "day" : "days"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This week</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold">{goals.cookedCount}</p>
              <p className="mb-1 text-muted-foreground">/ {goals.target} goal</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${weeklyPct}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <FlameIcon className="size-8 text-muted-foreground" />
            <p className="font-medium">No cooks logged yet</p>
            <p className="text-sm text-muted-foreground">Start tracking what you cook each day</p>
            <Button className="mt-2" onClick={openLog}>
              <PlusIcon className="size-4" />
              Log Cook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <Link
                    to="/recipes/$recipeId"
                    params={{ recipeId: String(entry.recipeId) }}
                    className="font-medium hover:underline"
                  >
                    {entry.recipe.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {entry.cookedBy && <span>{entry.cookedBy.name}</span>}
                    {entry.servings && <span>{entry.servings} servings</span>}
                  </div>
                  {entry.notes && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                      {entry.notes}
                    </p>
                  )}
                  {entry.rating !== null && (
                    <div className="mt-1.5 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <StarIcon
                          key={n}
                          className={`size-3.5 ${
                            n <= (entry.rating ?? 0) ? "text-primary" : "text-muted-foreground/30"
                          }`}
                          fill={n <= (entry.rating ?? 0) ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <p className="shrink-0 text-sm text-muted-foreground">
                  {new Date(entry.cookedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year:
                      new Date(entry.cookedAt).getFullYear() !== new Date().getFullYear()
                        ? "numeric"
                        : undefined,
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Log Cook dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="flex max-h-[80vh] flex-col">
          <DialogHeader>
            <DialogTitle>
              {step === "pick" ? "Choose a recipe" : `Log: ${form.recipeTitle}`}
            </DialogTitle>
          </DialogHeader>

          {step === "pick" ? (
            <>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search recipes…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto py-1">
                {filteredRecipes.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No recipes found</p>
                ) : (
                  filteredRecipes.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => selectRecipe(r.id, r.title)}
                      className="flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left hover:bg-accent"
                    >
                      <p className="text-sm font-medium">{r.title}</p>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Rating</p>
                <StarRating
                  value={form.rating ? Number(form.rating) : null}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, rating: v !== null ? String(v) : "" }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Notes</p>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="How did it go?"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Servings</p>
                  <Input
                    type="number"
                    min={1}
                    value={form.servings}
                    onChange={(e) => setForm((f) => ({ ...f, servings: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Date</p>
                  <Input
                    type="date"
                    value={form.cookedAt}
                    onChange={(e) => setForm((f) => ({ ...f, cookedAt: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep("pick")}>
                  Back
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
