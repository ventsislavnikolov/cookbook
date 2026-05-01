import { createFileRoute, Link } from "@tanstack/react-router"
import {
  BookOpenIcon,
  FolderOpenIcon,
  CalendarDaysIcon,
  ClipboardListIcon,
  HeartIcon,
  FlameIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSkeleton } from "@/components/skeletons/dashboard"
import { getDashboardStats } from "@/server/functions/dashboard"

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
  pendingComponent: DashboardSkeleton,
  loader: () => getDashboardStats(),
})

const quickLinks = [
  {
    title: "Recipes",
    description: "Browse and manage your recipe collection",
    to: "/recipes" as const,
    icon: BookOpenIcon,
  },
  {
    title: "Collections",
    description: "Organise recipes into themed collections",
    to: "/collections" as const,
    icon: FolderOpenIcon,
  },
  {
    title: "Meal Plan",
    description: "Plan your meals for the week",
    to: "/meal-plan" as const,
    icon: CalendarDaysIcon,
  },
  {
    title: "Cook Log",
    description: "Track what you've cooked and your ratings",
    to: "/cook-log" as const,
    icon: ClipboardListIcon,
  },
]

function Dashboard() {
  const stats = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">What would you like to do today?</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BookOpenIcon className="size-4" />
              Recipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalRecipes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <HeartIcon className="size-4" />
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.favoriteRecipes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FlameIcon className="size-4" />
              Cooked this week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.weekCookCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDaysIcon className="size-4" />
              Today's meals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.todaysPlan.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's meal plan */}
      {stats.todaysPlan.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {stats.todaysPlan.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="w-20 capitalize text-muted-foreground">{entry.mealType}</span>
                <Link
                  to="/recipes/$recipeId"
                  params={{ recipeId: String(entry.recipeId) }}
                  className="font-medium hover:underline"
                >
                  {entry.recipeTitle}
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent cooks */}
      {stats.recentCooks.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recently Cooked</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {stats.recentCooks.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-sm">
                <Link
                  to="/recipes/$recipeId"
                  params={{ recipeId: String(entry.recipeId) }}
                  className="font-medium hover:underline"
                >
                  {entry.recipe.title}
                </Link>
                <span className="text-muted-foreground">
                  {entry.cookedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group rounded-lg border bg-card p-5 shadow-sm transition-colors hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <item.icon className="size-5" />
              </div>
              <div>
                <p className="font-medium leading-none">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
