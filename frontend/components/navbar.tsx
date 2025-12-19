"use client"

import Link from "next/link"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notification-center"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">VisaVerse</span>
          </Link>

          <div className="flex items-center gap-2">
            <NotificationCenter />
            <ThemeToggle />
            <Link href="/onboarding">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
