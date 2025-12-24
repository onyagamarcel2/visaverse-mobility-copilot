"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  const { messages } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{messages.theme.toggleLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>{messages.theme.light}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>{messages.theme.dark}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>{messages.theme.system}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
