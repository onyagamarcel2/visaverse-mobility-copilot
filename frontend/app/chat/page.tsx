"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ChatBubble } from "@/components/chat/chat-bubble"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { SuggestedPrompts } from "@/components/chat/suggested-prompts"
import { EmptyState } from "@/components/empty-state"
import { Send, Trash2, MessageSquare } from "lucide-react"
import { apiClient } from "@/lib/api"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("visaverse_chat_history")
      if (saved) {
        return JSON.parse(saved)
      }
      const hasProfile = localStorage.getItem("visaverse_profile")
      if (!hasProfile) {
        return []
      }
    }
    return [
      {
        role: "assistant",
        content:
          "Hello! I'm your VisaVerse assistant. I can help answer questions about your visa application, required documents, and travel planning. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]
  })
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const profile = localStorage.getItem("visaverse_profile")
      setHasProfile(!!profile)
      if (!profile && messages.length === 0) {
        // User hasn't completed onboarding
      }
    }
  }, [messages.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("visaverse_chat_history", JSON.stringify(messages))
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Get profile from localStorage if available
      const profileData = localStorage.getItem("visaverse_profile")
      const context = profileData ? JSON.parse(profileData) : undefined

      const response = await apiClient.sendChatMessage(input, context)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } catch (error) {
      console.error("Error sending message:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt)
  }

  const handleClearChat = () => {
    const initialMessage: Message = {
      role: "assistant",
      content:
        "Hello! I'm your VisaVerse assistant. I can help answer questions about your visa application, required documents, and travel planning. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    setMessages([initialMessage])
    localStorage.removeItem("visaverse_chat_history")
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-6 px-6 flex items-center justify-center">
          <EmptyState
            icon={MessageSquare}
            title="Complete Your Profile First"
            description="To get personalized assistance from your AI copilot, please complete your onboarding profile first."
            actionLabel="Start Onboarding"
            onAction={() => router.push("/onboarding")}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1 pt-24 pb-6 px-6">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">Ask Your Copilot</h1>
              <p className="text-muted-foreground mt-2">Get instant answers to your visa and relocation questions.</p>
            </div>
            {messages.length > 1 && (
              <Button variant="outline" size="sm" onClick={handleClearChat} className="gap-2 bg-transparent">
                <Trash2 className="w-4 h-4" />
                Clear Chat
              </Button>
            )}
          </div>

          {/* Messages Container */}
          <Card className="flex-1 flex flex-col border-border overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <ChatBubble key={index} role={message.role} content={message.content} timestamp={message.timestamp} />
              ))}

              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} />

              {/* Show suggested prompts if no user messages yet */}
              {messages.length === 1 && (
                <div className="pt-4">
                  <SuggestedPrompts onSelectPrompt={handlePromptSelect} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
