import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { CommandPalette } from "@/components/command-palette"
import { ThemeProvider } from "@/components/theme-provider"
import { I18nProvider } from "@/lib/i18n"
import "./globals.css"

export const metadata: Metadata = {
  title: "VisaVerse - Your AI Copilot for Global Mobility",
  description: "Plan your visa, documents, and relocation steps effortlessly with AI-powered guidance.",
  generator: "v0.app",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "VisaVerse",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`font-sans antialiased`}>
        <I18nProvider>
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
