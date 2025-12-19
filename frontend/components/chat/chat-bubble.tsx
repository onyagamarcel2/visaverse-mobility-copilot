"use client"

import { Bot, User } from "lucide-react"

interface ChatBubbleProps {
  role: "user" | "assistant"
  content: string
  timestamp?: string
}

export function ChatBubble({ role, content, timestamp }: ChatBubbleProps) {
  const isUser = role === "user"

  return (
    <div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-primary" : "bg-accent"
        }`}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      {/* Message content */}
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        {timestamp && <span className="text-xs text-muted-foreground px-1">{timestamp}</span>}
      </div>
    </div>
  )
}
