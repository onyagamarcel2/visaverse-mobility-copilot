"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ChatFAB() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link href="/chat">
        <Button
          size="lg"
          aria-label="Open chat"
          className="rounded-full h-14 w-14 shadow-lg bg-accent hover:bg-accent/90 text-white relative group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute right-full mr-3 px-3 py-1 bg-foreground text-background text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Ask Copilot
          </span>
        </Button>
      </Link>
    </div>
  )
}
