"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Home, FileText, CheckSquare, MessageSquare, Clock, AlertTriangle, Download, Edit, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"

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
  const { messages } = useI18n()

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSearch("")
      setSelectedIndex(0)
    }
  }, [])

  const commands: Command[] = [
    {
      id: "home",
      title: messages.commandPalette.commands.home.title,
      description: messages.commandPalette.commands.home.description,
      icon: Home,
      action: () => router.push("/"),
      keywords: messages.commandPalette.commands.home.keywords,
    },
    {
      id: "onboarding",
      title: messages.commandPalette.commands.onboarding.title,
      description: messages.commandPalette.commands.onboarding.description,
      icon: Edit,
      action: () => router.push("/onboarding"),
      keywords: messages.commandPalette.commands.onboarding.keywords,
    },
    {
      id: "plan",
      title: messages.commandPalette.commands.plan.title,
      description: messages.commandPalette.commands.plan.description,
      icon: FileText,
      action: () => router.push("/plan"),
      keywords: messages.commandPalette.commands.plan.keywords,
    },
    {
      id: "timeline",
      title: messages.commandPalette.commands.timeline.title,
      description: messages.commandPalette.commands.timeline.description,
      icon: Clock,
      action: () => {
        router.push("/plan")
        setTimeout(() => {
          const tab = document.querySelector('[data-value="timeline"]')
          if (tab instanceof HTMLElement) tab.click()
        }, 100)
      },
      keywords: messages.commandPalette.commands.timeline.keywords,
    },
    {
      id: "checklist",
      title: messages.commandPalette.commands.checklist.title,
      description: messages.commandPalette.commands.checklist.description,
      icon: CheckSquare,
      action: () => {
        router.push("/plan")
        setTimeout(() => {
          const tab = document.querySelector('[data-value="checklist"]')
          if (tab instanceof HTMLElement) tab.click()
        }, 100)
      },
      keywords: messages.commandPalette.commands.checklist.keywords,
    },
    {
      id: "documents",
      title: messages.commandPalette.commands.documents.title,
      description: messages.commandPalette.commands.documents.description,
      icon: FileText,
      action: () => {
        router.push("/plan")
        setTimeout(() => {
          const tab = document.querySelector('[data-value="documents"]')
          if (tab instanceof HTMLElement) tab.click()
        }, 100)
      },
      keywords: messages.commandPalette.commands.documents.keywords,
    },
    {
      id: "risks",
      title: messages.commandPalette.commands.risks.title,
      description: messages.commandPalette.commands.risks.description,
      icon: AlertTriangle,
      action: () => {
        router.push("/plan")
        setTimeout(() => {
          const tab = document.querySelector('[data-value="risks"]')
          if (tab instanceof HTMLElement) tab.click()
        }, 100)
      },
      keywords: messages.commandPalette.commands.risks.keywords,
    },
    {
      id: "chat",
      title: messages.commandPalette.commands.chat.title,
      description: messages.commandPalette.commands.chat.description,
      icon: MessageSquare,
      action: () => router.push("/chat"),
      keywords: messages.commandPalette.commands.chat.keywords,
    },
    {
      id: "export",
      title: messages.commandPalette.commands.export.title,
      description: messages.commandPalette.commands.export.description,
      icon: Download,
      action: () => {
        const exportBtn = document.querySelector('[data-action="export"]')
        if (exportBtn instanceof HTMLElement) exportBtn.click()
      },
      keywords: messages.commandPalette.commands.export.keywords,
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-0">
          <DialogTitle className="sr-only">{messages.commandPalette.title}</DialogTitle>
          <DialogDescription className="sr-only">{messages.commandPalette.description}</DialogDescription>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedIndex(0)
              }}
              placeholder={messages.commandPalette.placeholder}
              className="pl-10 border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] px-2 py-2">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">{messages.commandPalette.empty}</div>
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
