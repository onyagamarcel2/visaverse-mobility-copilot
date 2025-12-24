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
import { useI18n } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"

const HISTORY_REQUEST_LIMIT = 12
const MAX_MESSAGE_LENGTH = 500
const MIN_SEND_INTERVAL_MS = 800

export default function ChatPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, messages: i18nMessages } = useI18n()

  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [lastSentAt, setLastSentAt] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const profile = useAppStore((state) => state.profile)
  const chatHistory = useAppStore((state) => state.chatHistory)
  const appendUserMessage = useAppStore((state) => state.appendUserMessage)
  const appendAssistantMessage = useAppStore((state) => state.appendAssistantMessage)
  const clearChat = useAppStore((state) => state.clearChat)
  const hydrateFromStorage = useAppStore((state) => state.hydrateFromStorage)
  const chatError = useAppStore((state) => state.chatError)
  const setChatError = useAppStore((state) => state.setChatError)
  const lastFailedMessage = useAppStore((state) => state.lastFailedMessage)
  const setLastFailedMessage = useAppStore((state) => state.setLastFailedMessage)
  const retryAvailableAt = useAppStore((state) => state.retryAvailableAt)
  const setRetryAvailableAt = useAppStore((state) => state.setRetryAvailableAt)
  const isHydrated = useAppStore((state) => state.isHydrated)

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  // Ensure an initial assistant message exists once we have a profile and are hydrated.
  useEffect(() => {
    if (!isHydrated) return
    if (!profile) return
    if (chatHistory.length > 0) return
    if (i18nMessages?.chat?.initialMessage) {
      appendAssistantMessage(i18nMessages.chat.initialMessage)
    }
  }, [isHydrated, profile, chatHistory.length, appendAssistantMessage, i18nMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatHistory, isTyping])

  const handleSend = async (overrideMessage?: string) => {
    const messageToSend = (overrideMessage ?? input).trim()
    if (!messageToSend || isTyping || !profile) return
    if (messageToSend.length > MAX_MESSAGE_LENGTH) {
      setChatError(i18nMessages.chat.tooLongError)
      toast({
        title: i18nMessages.chat.messageFailedTitle,
        description: i18nMessages.chat.tooLongError,
        variant: "destructive",
      })
      return
    }
    if (Date.now() - lastSentAt < MIN_SEND_INTERVAL_MS) {
      toast({
        title: i18nMessages.chat.messageFailedTitle,
        description: i18nMessages.chat.tooFastError,
        variant: "destructive",
      })
      return
    }

    const userMessage = appendUserMessage(messageToSend)
    setInput("")
    setIsTyping(true)
    setChatError(null)
    setLastSentAt(Date.now())

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
      const fallback =
        i18nMessages?.chat?.retryError ?? "Unable to send message. Please try again."
      const errorMessage = error instanceof Error ? error.message : fallback

      setChatError(errorMessage)
      setLastFailedMessage(messageToSend)
      setRetryAvailableAt(Date.now() + 1000)

      toast({
        title: i18nMessages?.chat?.messageFailedTitle ?? "Message failed",
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
    setLastFailedMessage(null)
    setRetryAvailableAt(0)
  }

  const handleRetry = () => {
    if (!lastFailedMessage) return
    if (retryAvailableAt > Date.now()) return
    void handleSend(lastFailedMessage)
  }

  const isClient = typeof window !== "undefined"
  const hasUserMessages = chatHistory.some((message) => message.role === "user")
  const isRetryCoolingDown = retryAvailableAt > Date.now()
  const retrySeconds = Math.max(0, Math.ceil((retryAvailableAt - Date.now()) / 1000))
  const retryLabel = isRetryCoolingDown
    ? i18nMessages.chat.statusRetryWait.replace("{seconds}", String(retrySeconds))
    : i18nMessages.chat.statusRetryReady

  if (!isClient || !isHydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-6 px-6 flex items-center justify-center text-muted-foreground">
          {i18nMessages?.common?.loading ?? "Loading your experience..."}
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
            <h2 className="text-2xl font-semibold">
              {i18nMessages.chat.emptyTitle}
            </h2>
            <p className="text-muted-foreground">
              {i18nMessages.chat.emptyDescription}
            </p>
            <Button onClick={() => router.push("/onboarding")} className="w-full">
              {i18nMessages.chat.emptyAction}
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
              <h1 className="text-3xl font-semibold text-foreground">
                {i18nMessages.chat.heroTitle}
              </h1>
              <p className="text-muted-foreground mt-2">
                {i18nMessages.chat.heroSubtitle}
              </p>
            </div>

            {chatHistory.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                className="gap-2 bg-transparent focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                <Trash2 className="w-4 h-4" />
                {t("common.clearChat")}
              </Button>
            )}
          </div>

          {/* Messages Container */}
          <Card className="flex-1 flex flex-col border-border overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(isTyping || chatError) && (
                <div className="flex flex-wrap items-center gap-2">
                  {isTyping && (
                    <Badge className="bg-primary/10 text-primary" variant="secondary">
                      {i18nMessages.chat.statusSending}
                    </Badge>
                  )}
                  {chatError && (
                    <Badge className="bg-destructive text-destructive-foreground" variant="secondary">
                      {retryLabel}
                    </Badge>
                  )}
                  {chatError && lastFailedMessage && !isRetryCoolingDown && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetry}
                      className="h-7 px-2"
                    >
                      {i18nMessages.chat.retryCta}
                    </Button>
                  )}
                </div>
              )}
              {chatHistory.map((message, index) => (
                <ChatBubble
                  key={`${message.timestamp}-${index}`}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
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
                      {i18nMessages.chat.retryCta}
                    </Button>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={i18nMessages.chat.placeholder}
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || isTyping || input.length > MAX_MESSAGE_LENGTH}
                  aria-label={i18nMessages.chat.placeholder}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {i18nMessages.chat.helper} •{" "}
                {i18nMessages.chat.maxLengthHint.replace("{max}", String(MAX_MESSAGE_LENGTH))}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
