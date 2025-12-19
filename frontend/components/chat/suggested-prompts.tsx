"use client"

import { Button } from "@/components/ui/button"

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void
}

const PROMPTS = [
  "What if my passport expires soon?",
  "Do I need health insurance?",
  "When should I book my visa appointment?",
  "How much money do I need to show?",
  "What documents need translation?",
  "Can I expedite the process?",
]

export function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Suggested questions:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {PROMPTS.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start text-left h-auto py-2 px-3 text-sm bg-transparent"
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt}
          </Button>
        ))}
      </div>
    </div>
  )
}
