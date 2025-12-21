import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { ProfileData } from "./api"
import type { UserProfile } from "./types"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const CHAT_STORAGE_KEY = "visaverse_chat_history"
const PROFILE_STORAGE_KEY = "visaverse_profile"
const PERSISTENCE_KEY = "visaverse_app_state"
const MAX_CHAT_HISTORY = 20

const initialAssistantMessage: ChatMessage = {
  role: "assistant",
  content:
    "Hello! I'm your VisaVerse assistant. I can help answer questions about your visa application, required documents, and travel planning. How can I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
}

const capHistory = (messages: ChatMessage[]) => {
  if (messages.length <= MAX_CHAT_HISTORY) return messages
  return messages.slice(-MAX_CHAT_HISTORY)
}

interface AppState {
  profile: UserProfile | ProfileData | null
  chatHistory: ChatMessage[]
  chatError: string | null
  lastFailedMessage: string | null
  isHydrated: boolean
  retryAvailableAt: number
  appendUserMessage: (content: string) => ChatMessage
  appendAssistantMessage: (content: string) => ChatMessage
  clearChat: () => void
  setProfile: (profile: UserProfile | ProfileData | null) => void
  hydrateFromStorage: () => void
  setChatError: (message: string | null) => void
  setLastFailedMessage: (message: string | null) => void
  setRetryAvailableAt: (timestamp: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      chatHistory: [initialAssistantMessage],
      chatError: null,
      lastFailedMessage: null,
      isHydrated: false,
      retryAvailableAt: 0,
      appendUserMessage: (content) => {
        const message: ChatMessage = {
          role: "user",
          content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }

        set((state) => ({
          chatHistory: capHistory([...state.chatHistory, message]),
          chatError: null,
        }))

        return message
      },
      appendAssistantMessage: (content) => {
        const message: ChatMessage = {
          role: "assistant",
          content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }

        set((state) => ({
          chatHistory: capHistory([...state.chatHistory, message]),
          chatError: null,
          lastFailedMessage: null,
        }))

        return message
      },
      clearChat: () =>
        set(() => ({
          chatHistory: [
            {
              ...initialAssistantMessage,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ],
          chatError: null,
          lastFailedMessage: null,
        })),
      setProfile: (profile) => set({ profile }),
      hydrateFromStorage: () => {
        if (typeof window === "undefined") return
        const currentState = get()
        if (currentState.isHydrated) return

        const legacyProfile = localStorage.getItem(PROFILE_STORAGE_KEY)
        const legacyChat = localStorage.getItem(CHAT_STORAGE_KEY)

        set((state) => {
          const parsedChat = legacyChat ? safeParseJSON<ChatMessage[]>(legacyChat) : null
          const chatHistory = parsedChat?.length ? capHistory(parsedChat) : state.chatHistory
          const parsedProfile = legacyProfile ? safeParseJSON<UserProfile | ProfileData>(legacyProfile) : null

          return {
            profile: parsedProfile ?? state.profile,
            chatHistory,
            isHydrated: true,
          }
        })
      },
      setChatError: (message) => set({ chatError: message }),
      setLastFailedMessage: (message) => set({ lastFailedMessage: message }),
      setRetryAvailableAt: (timestamp) => set({ retryAvailableAt: timestamp }),
    }),
    {
      name: PERSISTENCE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        chatHistory: state.chatHistory,
        lastFailedMessage: state.lastFailedMessage,
      }),
    },
  ),
)

function safeParseJSON<T = unknown>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error("Failed to parse JSON from storage", error)
    return null
  }
}
