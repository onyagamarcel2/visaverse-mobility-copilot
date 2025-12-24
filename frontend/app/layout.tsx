import type React from "react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { CommandPalette } from "@/components/command-palette"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider, type Locale } from "@/lib/i18n"
import "./globals.css"

export const metadata: Metadata = {
  title: "VisaVerse - Your AI Copilot for Global Mobility",
  description: "Plan your visa, documents, and relocation steps effortlessly with AI-powered guidance.",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/visaverse-logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/visaverse-logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/visaverse-logo.png",
        type: "image/png",
      },
    ],
    apple: "/visaverse-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VisaVerse",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("visaverse_locale")?.value as Locale | undefined
  const initialLocale: Locale = cookieLocale === "fr" ? "fr" : "en"

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`font-sans antialiased`}>
        <I18nProvider initialLocale={initialLocale}>
          <ThemeProvider defaultTheme="system" storageKey="visaverse-theme">
            {children}
            <CommandPalette />
            <Toaster />
          </ThemeProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
