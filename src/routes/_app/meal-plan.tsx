import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, XIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  getMealPlan,
  setMealPlanEntry,
  clearMealPlanEntry,
  type MealPlanEntry,
} from "@/server/functions/meal-plan"
import { listRecipes } from "@/server/functions/recipes"

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"] as const
type MealType = (typeof MEAL_TYPES)[number]

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
}

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0]
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export const Route = createFileRoute("/_app/meal-plan")({
  component: MealPlanPage,
  loader: () => {
    const weekStart = getMonday(new Date())
    return getMealPlan({ data: { weekStart: toDateString(weekStart) } })
  },
})

function MealPlanPage() {
  const initial = Route.useLoaderData()
  const [weekStart, setWeekStart] = React.useState(() => getMonday(new Date()))
  const [entries, setEntries] = React.useState<MealPlanEntry[]>(initial)
  const [loading, setLoading] = React.useState(false)

  // Recipe picker state
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [pickerSlot, setPickerSlot] = React.useState<{ date: string; mealType: MealType } | null>(null)
  const [allRecipes, setAllRecipes] = React.useState<Awaited<ReturnType<typeof listRecipes>>>([])
  const [search, setSearch] = React.useState("")
  const [assigning, setAssigning] = React.useState(false)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const entryMap = React.useMemo(() => {
    const map = new Map<string, MealPlanEntry>()
    for (const e of entries) {
      const key = `${toDateString(new Date(e.plannedDate))}:${e.mealType}`
      map.set(key, e)
    }
    return map
  }, [entries])

  async function navigateWeek(delta: number) {
    const newStart = addDays(weekStart, delta * 7)
    setLoading(true)
    try {
      const data = await getMealPlan({ data: { weekStart: toDateString(newStart) } })
      setEntries(data)
      setWeekStart(newStart)
    } finally {
      setLoading(false)
    }
  }

  async function openPicker(date: string, mealType: MealType) {
    const recipes = await listRecipes({ data: {} })
    setAllRecipes(recipes)
    setSearch("")
    setPickerSlot({ date, mealType })
    setPickerOpen(true)
  }

  async function handleAssign(recipeId: number) {
    if (!pickerSlot) return
    setAssigning(true)
    try {
      await setMealPlanEntry({
        data: {
          plannedDate: pickerSlot.date,
          mealType: pickerSlot.mealType,
          recipeId,
        },
      })
      const data = await getMealPlan({ data: { weekStart: toDateString(weekStart) } })
      setEntries(data)
      setPickerOpen(false)
    } finally {
      setAssigning(false)
    }
  }

  async function handleClear(id: number) {
    await clearMealPlanEntry({ data: id })
    const data = await getMealPlan({ data: { weekStart: toDateString(weekStart) } })
    setEntries(data)
  }

  const filteredRecipes = allRecipes.filter(
    (r) => !search || r.title.toLowerCase().includes(search.toLowerCase()),
  )

  const weekLabel = (() => {
    const end = addDays(weekStart, 6)
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    return `${fmt(weekStart)} – ${fmt(end)}`
  })()

  const isCurrentWeek = toDateString(weekStart) === toDateString(getMonday(new Date()))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meal Plan</h1>
          <p className="text-sm text-muted-foreground">{weekLabel}</p>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)} disabled={loading}>
            <ChevronLeftIcon className="size-4" />
          </Button>
          {!isCurrentWeek && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const now = getMonday(new Date())
                setLoading(true)
                getMealPlan({ data: { weekStart: toDateString(now) } }).then((data) => {
                  setEntries(data)
                  setWeekStart(now)
                  setLoading(false)
                })
              }}
              disabled={loading}
            >
              Today
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={() => navigateWeek(1)} disabled={loading}>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] table-fixed border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-24 border-r px-3 py-2 text-left text-xs font-medium text-muted-foreground" />
              {days.map((day, i) => {
                const isToday = toDateString(day) === toDateString(new Date())
                return (
                  <th
                    key={i}
                    className="border-r px-2 py-2 text-center text-xs font-medium last:border-r-0"
                  >
                    <span className={isToday ? "font-bold text-primary" : "text-muted-foreground"}>
                      {DAY_NAMES[i]}
                    </span>
                    <br />
                    <span className={isToday ? "font-bold text-primary" : ""}>
                      {day.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {MEAL_TYPES.map((mealType) => (
              <tr key={mealType} className="border-b last:border-b-0">
                <td className="border-r px-3 py-2 text-xs font-medium text-muted-foreground">
                  {MEAL_LABELS[mealType]}
                </td>
                {days.map((day, i) => {
                  const dateStr = toDateString(day)
                  const entry = entryMap.get(`${dateStr}:${mealType}`)
                  return (
                    <td key={i} className="border-r p-1 last:border-r-0">
                      {entry ? (
                        <div className="group relative rounded-md bg-primary/5 px-2 py-1.5 text-xs">
                          <p className="line-clamp-2 font-medium leading-snug pr-4">
                            {entry.recipe.title}
                          </p>
                          {entry.recipe.cuisine && (
                            <p className="text-muted-foreground truncate">{entry.recipe.cuisine}</p>
                          )}
                          <button
                            onClick={() => handleClear(entry.id)}
                            className="absolute right-1 top-1 rounded p-0.5 opacity-0 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                          >
                            <XIcon className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openPicker(dateStr, mealType)}
                          className="flex h-full min-h-[52px] w-full items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:opacity-100 group-hover:opacity-50"
                        >
                          <PlusIcon className="size-3.5" />
                        </button>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="flex max-h-[80vh] flex-col">
          <DialogHeader>
            <DialogTitle>
              {pickerSlot
                ? `${MEAL_LABELS[pickerSlot.mealType]} — ${new Date(pickerSlot.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}`
                : "Choose a recipe"}
            </DialogTitle>
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
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto py-1">
            {filteredRecipes.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No recipes found</p>
            ) : (
              filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{recipe.title}</p>
                    <div className="flex gap-1 mt-0.5">
                      {recipe.cuisine && (
                        <span className="text-xs text-muted-foreground">{recipe.cuisine}</span>
                      )}
                      {recipe.difficulty && (
                        <Badge variant="outline" className="h-4 px-1 text-[10px]">
                          {recipe.difficulty}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={assigning}
                    onClick={() => handleAssign(recipe.id)}
                  >
                    Add
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
