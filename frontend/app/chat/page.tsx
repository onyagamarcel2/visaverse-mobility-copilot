"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, MessageSquare, Send, Trash2 } from "lucide-react"

import { SuggestedPrompts } from "@/components/chat/suggested-prompts"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { ChatBubble } from "@/components/chat/chat-bubble"
import { Navbar } from "@/components/navbar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { useAppStore } from "@/lib/store"

const HISTORY_REQUEST_LIMIT = 12

export default function ChatPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    profile,
    chatHistory,
    appendUserMessage,
    appendAssistantMessage,
    clearChat,
    hydrateFromStorage,
    chatError,
    setChatError,
    lastFailedMessage,
    setLastFailedMessage,
    retryAvailableAt,
    setRetryAvailableAt,
    isHydrated,
  } = useAppStore((state) => ({
    profile: state.profile,
    chatHistory: state.chatHistory,
    appendUserMessage: state.appendUserMessage,
    appendAssistantMessage: state.appendAssistantMessage,
    clearChat: state.clearChat,
    hydrateFromStorage: state.hydrateFromStorage,
    chatError: state.chatError,
    setChatError: state.setChatError,
    lastFailedMessage: state.lastFailedMessage,
    setLastFailedMessage: state.setLastFailedMessage,
    retryAvailableAt: state.retryAvailableAt,
    setRetryAvailableAt: state.setRetryAvailableAt,
    isHydrated: state.isHydrated,
  }))

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory, isTyping])

  const handleSend = async (overrideMessage?: string) => {
    const messageToSend = (overrideMessage ?? input).trim()
    if (!messageToSend || isTyping || !profile) return

    const userMessage = appendUserMessage(messageToSend)
    setInput("")
    setIsTyping(true)
    setChatError(null)

    const historyForRequest = [...chatHistory, userMessage]
      .slice(-HISTORY_REQUEST_LIMIT)
      .map(({ role, content }) => ({ role, content }))

    try {
      const response = await apiClient.sendChatMessage({
        message: messageToSend,
        profile,
        history: historyForRequest,
      })

      appendAssistantMessage(response)
      setLastFailedMessage(null)
      setRetryAvailableAt(0)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to send message. Please try again."
      setChatError(errorMessage)
      setLastFailedMessage(messageToSend)
      setRetryAvailableAt(Date.now() + 1000)

      toast({
        title: "Message failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt)
  }

  const handleClearChat = () => {
    clearChat()
    setChatError(null)
  }

  const handleRetry = () => {
    if (!lastFailedMessage) return
    if (retryAvailableAt > Date.now()) return

    void handleSend(lastFailedMessage)
  }

  const hasUserMessages = chatHistory.some((message) => message.role === "user")
  const isRetryCoolingDown = retryAvailableAt > Date.now()

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-6 px-6 flex items-center justify-center text-muted-foreground">
          Loading your chat experience...
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-6 px-6 flex items-center justify-center">
          <Card className="max-w-lg w-full p-8 space-y-4 text-center">
            <MessageSquare className="w-10 h-10 mx-auto text-primary" />
            <h2 className="text-2xl font-semibold">Complete Your Profile First</h2>
            <p className="text-muted-foreground">
              To get personalized assistance from your AI copilot, please complete your onboarding profile first.
            </p>
            <Button onClick={() => router.push("/onboarding")} className="w-full">
              Go to Onboarding
            </Button>
          </Card>
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
            {chatHistory.length > 1 && (
              <Button variant="outline" size="sm" onClick={handleClearChat} className="gap-2 bg-transparent">
                <Trash2 className="w-4 h-4" />
                Clear Chat
              </Button>
            )}
          </div>

          {/* Messages Container */}
          <Card className="flex-1 flex flex-col border-border overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatHistory.map((message, index) => (
                <ChatBubble key={`${message.timestamp}-${index}`} role={message.role} content={message.content} timestamp={message.timestamp} />
              ))}

              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} />

              {/* Show suggested prompts if no user messages yet */}
              {!hasUserMessages && (
                <div className="pt-4">
                  <SuggestedPrompts onSelectPrompt={handlePromptSelect} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4 space-y-3">
              {chatError && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <Badge variant="destructive" className="gap-2">
                    <AlertCircle className="w-3 h-3" />
                    {chatError}
                  </Badge>
                  {lastFailedMessage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      disabled={isTyping || isRetryCoolingDown}
                      className="self-start sm:self-auto"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              )}

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
                  onClick={() => void handleSend()}
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
