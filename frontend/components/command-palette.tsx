"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, FileText, CheckSquare, MessageSquare, Clock, AlertTriangle, Download, Edit, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface Command {
  id: string
  title: string
  description: string
  icon: any
  action: () => void
  keywords: string[]
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const commands: Command[] = [
    {
      id: "home",
      title: "Go to Home",
      description: "Navigate to the homepage",
      icon: Home,
      action: () => router.push("/"),
      keywords: ["home", "landing", "start"],
    },
    {
      id: "onboarding",
      title: "Start Onboarding",
      description: "Begin or edit your profile",
      icon: Edit,
      action: () => router.push("/onboarding"),
      keywords: ["onboarding", "profile", "edit", "form"],
    },
    {
      id: "plan",
      title: "View Plan",
      description: "See your mobility plan",
      icon: FileText,
      action: () => router.push("/plan"),
      keywords: ["plan", "view", "summary"],
    },
    {
      id: "timeline",
      title: "View Timeline",
      description: "Check your timeline",
      icon: Clock,
      action: () => {
        router.push("/plan")
        setTimeout(() => {
          const tab = document.querySelector('[data-value="timeline"]')
          if (tab instanceof HTMLElement) tab.click()
        }, 100)
      },
      keywords: ["timeline", "schedule", "dates"],
    },
    {
      id: "checklist",
      title: "View Checklist",
      description: "See your action items",
      icon: CheckSquare,
      action: () => {
        router.push("/plan")
        setTimeout(() => {
          const tab = document.querySelector('[data-value="checklist"]')
          if (tab instanceof HTMLElement) tab.click()
        }, 100)
      },
      keywords: ["checklist", "tasks", "todo"],
    },
    {
      id: "documents",
      title: "View Documents",
      description: "Check required documents",
      icon: FileText,
      action: () => {
        router.push("/plan")
        setTimeout(() => {
          const tab = document.querySelector('[data-value="documents"]')
          if (tab instanceof HTMLElement) tab.click()
        }, 100)
      },
      keywords: ["documents", "files", "paperwork"],
    },
    {
      id: "risks",
      title: "View Risks",
      description: "See potential risks",
      icon: AlertTriangle,
      action: () => {
        router.push("/plan")
        setTimeout(() => {
          const tab = document.querySelector('[data-value="risks"]')
          if (tab instanceof HTMLElement) tab.click()
        }, 100)
      },
      keywords: ["risks", "warnings", "issues"],
    },
    {
      id: "chat",
      title: "Open Chat",
      description: "Chat with AI copilot",
      icon: MessageSquare,
      action: () => router.push("/chat"),
      keywords: ["chat", "ai", "copilot", "help"],
    },
    {
      id: "export",
      title: "Export Plan",
      description: "Download your plan as PDF",
      icon: Download,
      action: () => {
        const exportBtn = document.querySelector('[data-action="export"]')
        if (exportBtn instanceof HTMLElement) exportBtn.click()
      },
      keywords: ["export", "download", "pdf", "save"],
    },
  ]

  const filteredCommands = commands.filter((command) => {
    const searchLower = search.toLowerCase()
    return (
      command.title.toLowerCase().includes(searchLower) ||
      command.description.toLowerCase().includes(searchLower) ||
      command.keywords.some((keyword) => keyword.includes(searchLower))
    )
  })

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }

      if (open) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % filteredCommands.length)
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length)
        } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
          e.preventDefault()
          filteredCommands[selectedIndex].action()
          setOpen(false)
          setSearch("")
        }
      }
    },
    [open, selectedIndex, filteredCommands],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (!open) {
      setSearch("")
      setSelectedIndex(0)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="sr-only">Command Palette</DialogTitle>
          <DialogDescription className="sr-only">Search and navigate quickly through the app</DialogDescription>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedIndex(0)
              }}
              placeholder="Search commands..."
              className="pl-10 border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] px-2 py-2">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No commands found</div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon
                return (
                  <button
                    key={command.id}
                    onClick={() => {
                      command.action()
                      setOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      selectedIndex === index && "bg-accent text-accent-foreground",
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{command.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{command.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <div className="px-4 py-3 border-t text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-muted rounded text-[10px] font-mono">ESC</kbd>
            <span>Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
