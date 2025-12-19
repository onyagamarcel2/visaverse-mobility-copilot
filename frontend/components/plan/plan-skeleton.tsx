import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PlanSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Cards Skeleton */}
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 border-border">
            <Skeleton className="h-8 w-16 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <Card className="p-6 border-border">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-3 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
