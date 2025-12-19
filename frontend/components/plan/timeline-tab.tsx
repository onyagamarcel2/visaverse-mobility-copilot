"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Circle, CheckCircle2, CalendarIcon, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TimelineGantt } from "@/components/charts/timeline-gantt"

export function TimelineTab() {
  const { toast } = useToast()

  const milestones = [
    {
      title: "Initial Document Gathering",
      date: "Week 1-2",
      dueDate: "2025-01-15",
      status: "pending",
      description: "Collect passport, photos, and personal identification documents",
    },
    {
      title: "Financial Documentation",
      date: "Week 2-3",
      dueDate: "2025-01-22",
      status: "pending",
      description: "Prepare bank statements, proof of funds, and employment letters",
    },
    {
      title: "Application Submission",
      date: "Week 3-4",
      dueDate: "2025-01-29",
      status: "pending",
      description: "Complete visa application forms and submit with all supporting documents",
    },
    {
      title: "Biometrics Appointment",
      date: "Week 4-5",
      dueDate: "2025-02-05",
      status: "pending",
      description: "Attend biometrics appointment at visa application center",
    },
    {
      title: "Processing Period",
      date: "Week 5-7",
      dueDate: "2025-02-19",
      status: "pending",
      description: "Application under review by immigration authorities",
    },
    {
      title: "Decision & Collection",
      date: "Week 7-8",
      dueDate: "2025-02-26",
      status: "pending",
      description: "Receive visa decision and collect passport",
    },
    {
      title: "Travel Preparation",
      date: "Week 8+",
      dueDate: "2025-03-05",
      status: "pending",
      description: "Book flights, arrange accommodation, and finalize travel plans",
    },
  ]

  const ganttMilestones = [
    {
      title: "Initial Document Gathering",
      startDate: "2025-01-08",
      endDate: "2025-01-15",
      status: "pending" as const,
    },
    {
      title: "Financial Documentation",
      startDate: "2025-01-15",
      endDate: "2025-01-22",
      status: "pending" as const,
    },
    {
      title: "Application Submission",
      startDate: "2025-01-22",
      endDate: "2025-01-29",
      status: "pending" as const,
    },
    {
      title: "Biometrics Appointment",
      startDate: "2025-01-29",
      endDate: "2025-02-05",
      status: "pending" as const,
    },
    {
      title: "Processing Period",
      startDate: "2025-02-05",
      endDate: "2025-02-19",
      status: "pending" as const,
    },
    {
      title: "Decision & Collection",
      startDate: "2025-02-19",
      endDate: "2025-02-26",
      status: "pending" as const,
    },
    {
      title: "Travel Preparation",
      startDate: "2025-02-26",
      endDate: "2025-03-05",
      status: "pending" as const,
    },
  ]

  const handleExportToCalendar = (type: "google" | "apple" | "outlook") => {
    const events = milestones.map((milestone) => ({
      title: milestone.title,
      description: milestone.description,
      date: milestone.dueDate,
    }))

    // Generate .ics file content for calendar apps
    const icsContent = generateICS(events)

    if (type === "google") {
      // Generate Google Calendar link
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        milestones[0].title,
      )}&dates=${milestones[0].dueDate.replace(/-/g, "")}/${milestones[0].dueDate.replace(/-/g, "")}&details=${encodeURIComponent(milestones[0].description)}`

      window.open(googleCalendarUrl, "_blank")
      toast({
        title: "Opening Google Calendar",
        description: "Add each milestone to your calendar.",
      })
    } else {
      // Download .ics file for Apple Calendar and Outlook
      const blob = new Blob([icsContent], { type: "text/calendar" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "visaverse-timeline.ics"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Calendar File Downloaded",
        description: `Import the .ics file into ${type === "apple" ? "Apple Calendar" : "Outlook"}.`,
      })
    }
  }

  const generateICS = (events: { title: string; description: string; date: string }[]) => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//VisaVerse//Timeline//EN\n"

    events.forEach((event) => {
      const dateStr = event.date.replace(/-/g, "")
      icsContent += `BEGIN:VEVENT\nDTSTART:${dateStr}\nDTEND:${dateStr}\nSUMMARY:${event.title}\nDESCRIPTION:${event.description}\nEND:VEVENT\n`
    })

    icsContent += "END:VCALENDAR"
    return icsContent
  }

  return (
    <div className="space-y-6">
      <TimelineGantt milestones={ganttMilestones} />

      <Card className="p-6 border-border">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Your Journey Timeline</h2>
            <p className="text-muted-foreground">
              Estimated timeline based on your departure date and typical processing times.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportToCalendar("google")}
              className="gap-2 bg-transparent hover:scale-105 transition-transform whitespace-nowrap"
            >
              <CalendarIcon className="w-4 h-4" />
              Google
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportToCalendar("apple")}
              className="gap-2 bg-transparent hover:scale-105 transition-transform whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Apple
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportToCalendar("outlook")}
              className="gap-2 bg-transparent hover:scale-105 transition-transform whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Outlook
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={index} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                {milestone.status === "completed" ? (
                  <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                )}
                {index < milestones.length - 1 && <div className="w-0.5 h-full bg-border mt-2 flex-1 min-h-[40px]" />}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                  <Badge variant="outline" className="ml-2">
                    {milestone.date}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
