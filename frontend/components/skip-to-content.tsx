"use client"

import { useI18n } from "@/lib/i18n"

export function SkipToContent() {
  const { t } = useI18n()
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
    >
      {t("common.skipToContent")}
    </a>
  )
}
