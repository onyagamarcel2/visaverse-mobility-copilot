import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "../lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Admin Control Plane | VisaVerse",
  description: "Administrative control plane for VisaVerse mobility copilot",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("bg-background text-foreground min-h-screen", inter.variable)}>
        {children}
      </body>
    </html>
  )
}
