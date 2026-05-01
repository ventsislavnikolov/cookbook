import { Skeleton } from "@/components/ui/skeleton"

export function MealPlanSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex items-center gap-1">
          <Skeleton className="size-9" />
          <Skeleton className="size-9" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] table-fixed border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-24 border-r px-3 py-2" />
              {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className="border-r px-2 py-2 text-center last:border-r-0">
                  <Skeleton className="mx-auto h-3 w-8" />
                  <Skeleton className="mx-auto mt-1 h-3 w-6" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, r) => (
              <tr key={r} className="border-b last:border-b-0">
                <td className="border-r px-3 py-2">
                  <Skeleton className="h-3 w-16" />
                </td>
                {Array.from({ length: 7 }).map((_, c) => (
                  <td key={c} className="border-r p-1 last:border-r-0">
                    <Skeleton className="h-[52px] w-full rounded-md" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
