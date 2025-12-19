"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log("[v0] User response to install prompt:", outcome)

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <Card className="fixed bottom-4 right-4 z-50 p-4 border-primary shadow-lg max-w-sm animate-in slide-in-from-bottom">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">Install VisaVerse</h4>
          <p className="text-sm text-muted-foreground mb-3">Install the app for quick access and offline features</p>
          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Install
            </Button>
            <Button onClick={handleDismiss} size="sm" variant="ghost">
              Not now
            </Button>
          </div>
        </div>
        <Button onClick={handleDismiss} variant="ghost" size="sm" className="h-6 w-6 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
