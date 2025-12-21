"use client"

import Link from "next/link"
import { Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notification-center"
import { useI18n } from "@/lib/i18n"

export function Navbar() {
  const { t, locale, setLocale } = useI18n()
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">{t("navbar.brand")}</span>
          </Link>

          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="locale-select">
              Language
            </label>
            <select
              id="locale-select"
              value={locale}
              onChange={(e) => setLocale(e.target.value as typeof locale)}
              className="h-10 rounded-md border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <option value="en">EN</option>
              <option value="fr">FR</option>
            </select>
            <NotificationCenter />
            <ThemeToggle />
            <Link href="/onboarding">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
                {t("common.getStarted")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
