"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Circle, CheckCircle2, CalendarIcon, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TimelineGantt } from "@/components/charts/timeline-gantt"
import type { PlanResponse, ProfileData } from "@/lib/api"
import { PlanNoData } from "@/components/plan/no-data"
import { useI18n } from "@/lib/i18n"

interface TimelineTabProps {
  timeline: PlanResponse["timeline"]
  profile?: ProfileData | null
}

type CalendarEvent = {
  title: string
  description: string
  date: Date
  status: "pending" | "completed" | "in-progress"
}

const WEEK_REGEX = /(\d+)(?:\s*-\s*(\d+))?/

const parseWeekLabel = (label: string): number | null => {
  const match = label.match(WEEK_REGEX)
  if (!match) return null
  const [, start, end] = match
  return end ? Number(end) : Number(start)
}

const resolveEventDate = (label: string, fallbackStart: Date, index: number, departureDate?: string) => {
  if (label) {
    const parsed = new Date(label)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
    const weekNumber = parseWeekLabel(label)
    if (weekNumber) {
      const departure = departureDate ? new Date(departureDate) : null
      const base = departure && !Number.isNaN(departure.getTime()) ? departure : fallbackStart
      const candidate = new Date(base)
      candidate.setDate(candidate.getDate() - 7 * Math.max(1, FALLBACK_TIMELINE.length - weekNumber))
      return candidate
    }
  }
  const fallback = new Date(fallbackStart)
  fallback.setDate(fallbackStart.getDate() + index * 7)
  return fallback
}

const formatDateForDisplay = (date: Date) => {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatDateForICS = (date: Date) => {
  return date.toISOString().slice(0, 10).replace(/-/g, "")
}

export function TimelineTab({ timeline, profile }: TimelineTabProps) {
  const { toast } = useToast()
  const { messages } = useI18n()
  if (timeline.length === 0) {
    return (
      <PlanNoData
        title={messages.plan.noData.timelineTitle}
        description={messages.plan.noData.timelineDescription}
      />
    )
  }

  const fallbackStart = new Date(profile?.departureDate || new Date().toISOString().slice(0, 10))
  fallbackStart.setDate(fallbackStart.getDate() - timeline.length * 7)

  const events: CalendarEvent[] = timeline.map((item, index) => {
    const eventDate = resolveEventDate(item.date, fallbackStart, index, profile?.departureDate)
    return {
      title: item.title,
      description: item.description,
      date: eventDate,
      status: item.status ?? "pending",
    }
  })

  const ganttMilestones = events.map((event) => {
    const start = new Date(event.date)
    start.setDate(start.getDate() - 2)
    const end = new Date(event.date)
    end.setDate(end.getDate() + 2)
    return {
      title: event.title,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      status: event.status,
    }
  })

  const handleExportToCalendar = (type: "google" | "apple" | "outlook") => {
    if (events.length === 0) return
    const icsContent = generateICS(events)

    if (type === "google") {
      const first = events[0]
      const start = formatDateForICS(first.date)
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        first.title,
      )}&dates=${start}/${start}&details=${encodeURIComponent(first.description)}`
      window.open(googleCalendarUrl, "_blank")
      toast({
        title: messages.plan.timeline.exportGoogleToastTitle,
        description: messages.plan.timeline.exportGoogleToastDescription,
      })
      return
    }

    const blob = new Blob([icsContent], { type: "text/calendar" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = messages.plan.timeline.icsFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast({
      title: messages.plan.timeline.exportFileToastTitle,
      description:
        type === "apple"
          ? messages.plan.timeline.exportFileToastDescriptionApple
          : messages.plan.timeline.exportFileToastDescriptionOutlook,
    })
  }

  const generateICS = (items: CalendarEvent[]) => {
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//VisaVerse//Timeline//EN\n"
    items.forEach((event) => {
      const start = formatDateForICS(event.date)
      ics += `BEGIN:VEVENT\nDTSTART:${start}\nDTEND:${start}\nSUMMARY:${event.title}\nDESCRIPTION:${event.description}\nEND:VEVENT\n`
    })
    ics += "END:VCALENDAR"
    return ics
  }

  return (
    <div className="space-y-6">
      <TimelineGantt milestones={ganttMilestones} />

      <Card className="p-6 border-border">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{messages.plan.timeline.title}</h2>
            <p className="text-muted-foreground">{messages.plan.timeline.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportToCalendar("google")}
              className="gap-2 bg-transparent hover:scale-105 transition-transform whitespace-nowrap"
            >
              <CalendarIcon className="w-4 h-4" />
              {messages.plan.timeline.exportGoogle}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportToCalendar("apple")}
              className="gap-2 bg-transparent hover:scale-105 transition-transform whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              {messages.plan.timeline.exportApple}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportToCalendar("outlook")}
              className="gap-2 bg-transparent hover:scale-105 transition-transform whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              {messages.plan.timeline.exportOutlook}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {events.map((milestone, index) => (
            <Card key={`${milestone.title}-${index}`} className="p-4 border border-border bg-secondary/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {milestone.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <p className="text-sm font-semibold text-foreground">{milestone.title}</p>
                    <Badge className="bg-primary/10 text-primary">
                      {timeline[index]?.date || messages.plan.timeline.badgeTbd}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{milestone.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{messages.plan.timeline.targetLabel}</p>
                  <p className="text-sm font-semibold text-foreground">{formatDateForDisplay(milestone.date)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}
