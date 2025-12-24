"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notification-center"
import { useI18n } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"

export function Navbar() {
  const { t, locale, setLocale } = useI18n()
  const profile = useAppStore((state) => state.profile)
  const setProfile = useAppStore((state) => state.setProfile)
  const setPlan = useAppStore((state) => state.setPlan)
  const syncPlan = useAppStore((state) => state.syncPlan)
  const resetChatForLocale = useAppStore((state) => state.resetChatForLocale)

  const handleLocaleChange = async (nextLocale: typeof locale) => {
    setLocale(nextLocale)
    resetChatForLocale(nextLocale)
    if (profile && typeof profile === "object" && "language" in profile) {
      const updatedProfile = { ...profile, language: nextLocale }
      setProfile(updatedProfile)
      if (typeof window !== "undefined") {
        localStorage.setItem("visaverse_profile", JSON.stringify(updatedProfile))
      }
      setPlan(null, null)
      await syncPlan()
    }
  }
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/visaverse-logo.png"
              alt="VisaVerse logo"
              width={84}
              height={84}
              priority
              className="rounded-lg border border-border bg-card"
            />
          </Link>

          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="locale-select">
              {t("common.languageLabel")}
            </label>
            <select
              id="locale-select"
              value={locale}
              onChange={(e) => void handleLocaleChange(e.target.value as typeof locale)}
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
