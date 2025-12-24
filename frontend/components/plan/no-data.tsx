"use client"

import { Inbox } from "lucide-react"
import { Card } from "@/components/ui/card"

interface PlanNoDataProps {
  title?: string
  description?: string
}

export function PlanNoData({
  title = "No data available",
  description = "We could not find any content for this section yet.",
}: PlanNoDataProps) {
  return (
    <Card className="p-8 border-dashed border-border text-center flex flex-col items-center gap-3 bg-muted/30" role="status">
      <Inbox className="w-10 h-10 text-muted-foreground" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Card>
  )
}
