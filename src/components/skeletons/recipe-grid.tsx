import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function RecipeGridSkeleton({
  showFilters = true,
  showAction = true,
}: {
  showFilters?: boolean
  showAction?: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        {showAction && <Skeleton className="h-9 w-32" />}
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-9 flex-1 min-w-[200px]" />
          <Skeleton className="h-9 w-[140px]" />
          <Skeleton className="h-9 w-[130px]" />
          <Skeleton className="size-9" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="size-4 shrink-0" />
              </div>
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1 h-3 w-2/3" />
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
