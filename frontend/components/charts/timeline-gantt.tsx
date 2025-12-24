"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"

interface TimelineGanttProps {
  milestones: Array<{
    title: string
    startDate: string
    endDate: string
    status: "completed" | "in-progress" | "pending"
  }>
}

export function TimelineGantt({ milestones }: TimelineGanttProps) {
  const { messages } = useI18n()
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success"
      case "in-progress":
        return "bg-accent"
      default:
        return "bg-muted"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return messages.plan.timeline.statusCompleted
      case "in-progress":
        return messages.plan.timeline.statusInProgress
      default:
        return messages.plan.timeline.statusPending
    }
  }

  // Calculate position based on dates
  const getBarPosition = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays =
      milestones.reduce((acc, m) => {
        const mEnd = new Date(m.endDate)
        return Math.max(acc, mEnd.getTime())
      }, 0) - new Date(milestones[0].startDate).getTime()

    const startOffset = ((start.getTime() - new Date(milestones[0].startDate).getTime()) / totalDays) * 100
    const duration = ((end.getTime() - start.getTime()) / totalDays) * 100

    return { left: `${startOffset}%`, width: `${duration}%` }
  }

  return (
    <Card className="p-6 border-border">
      <h3 className="font-semibold text-foreground mb-6">{messages.plan.timeline.ganttTitle}</h3>

      <div className="space-y-6">
        {milestones.map((milestone, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{milestone.title}</span>
              <Badge variant="outline" className="text-xs">
                {getStatusLabel(milestone.status)}
              </Badge>
            </div>

            <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
              <div
                className={`absolute h-full ${getStatusColor(milestone.status)} rounded-lg transition-all duration-500`}
                style={getBarPosition(milestone.startDate, milestone.endDate)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success" />
          <span className="text-xs text-muted-foreground">{messages.plan.timeline.statusCompleted}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-accent" />
          <span className="text-xs text-muted-foreground">{messages.plan.timeline.statusInProgress}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-muted" />
          <span className="text-xs text-muted-foreground">{messages.plan.timeline.statusPending}</span>
        </div>
      </div>
    </Card>
  )
}
