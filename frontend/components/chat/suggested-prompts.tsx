"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void
}

export function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  const { messages } = useI18n()
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{messages.chat.suggestedLabel}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {messages.chat.prompts.map((prompt: string, index: number) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start text-left h-auto py-2 px-3 text-sm bg-transparent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  )
}
