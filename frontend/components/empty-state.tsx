"use client"

import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card className="p-12 text-center border-dashed" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="mt-4 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            aria-label={actionLabel}
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  )
}
