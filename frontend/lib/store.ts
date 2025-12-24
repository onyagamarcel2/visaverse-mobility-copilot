import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { apiClient, type PlanResponse, type ProfileData } from "./api"
import type { UserProfile } from "./types"

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const CHAT_STORAGE_KEY = "visaverse_chat_history"
const PROFILE_STORAGE_KEY = "visaverse_profile"
const PLAN_STORAGE_KEY = "visaverse_plan"
const PERSISTENCE_KEY = "visaverse_app_state"
const MAX_CHAT_HISTORY = 20
const PLAN_SYNC_THRESHOLD_MS = 1000 * 60 * 60 * 6 // 6 hours

const INITIAL_ASSISTANT_MESSAGE: Record<"en" | "fr", string> = {
  en: "Hello! I'm your VisaVerse assistant. I can help answer questions about your visa application, required documents, and travel planning. How can I help you today?",
  fr: "Bonjour ! Je suis votre assistant VisaVerse. Je peux vous aider pour votre demande de visa, les documents requis et la planification du voyage. Comment puis-je vous aider ?",
}

const buildInitialAssistantMessage = (locale: "en" | "fr"): ChatMessage => ({
  role: "assistant",
  content: INITIAL_ASSISTANT_MESSAGE[locale],
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
})

const capHistory = (messages: ChatMessage[]) => {
  if (messages.length <= MAX_CHAT_HISTORY) return messages
  return messages.slice(-MAX_CHAT_HISTORY)
}

interface AppState {
  profile: UserProfile | ProfileData | null
  plan: PlanResponse | null
  planFetchedAt: number | null
  isFetchingPlan: boolean
  planError: string | null
  chatHistory: ChatMessage[]
  chatError: string | null
  lastFailedMessage: string | null
  isHydrated: boolean
  retryAvailableAt: number
  completedChecklistIds: string[]
  appendUserMessage: (content: string) => ChatMessage
  appendAssistantMessage: (content: string) => ChatMessage
  clearChat: () => void
  resetChatForLocale: (locale: "en" | "fr") => void
  toggleChecklistItem: (id: string) => void
  setCompletedChecklistIds: (ids: string[]) => void
  setProfile: (profile: UserProfile | ProfileData | null) => void
  setPlan: (plan: PlanResponse | null, fetchedAt?: number | null) => void
  hydrateFromStorage: () => void
  syncPlan: () => Promise<void>
  setChatError: (message: string | null) => void
  setLastFailedMessage: (message: string | null) => void
  setRetryAvailableAt: (timestamp: number) => void
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      chatHistory: [buildInitialAssistantMessage("en")],
      plan: null,
      planFetchedAt: null,
      planError: null,
      isFetchingPlan: false,
      chatError: null,
      lastFailedMessage: null,
      isHydrated: false,
      retryAvailableAt: 0,
      completedChecklistIds: [],
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
      clearChat: () => {
        const currentProfile = get().profile
        const locale =
          currentProfile && typeof currentProfile === "object" && "language" in currentProfile
            ? ((currentProfile.language as string) || "en").toLowerCase()
            : "en"
        const safeLocale = locale === "fr" ? "fr" : "en"
        set(() => ({
          chatHistory: [buildInitialAssistantMessage(safeLocale)],
          chatError: null,
          lastFailedMessage: null,
        }))
      },
      resetChatForLocale: (locale) =>
        set(() => ({
          chatHistory: [buildInitialAssistantMessage(locale)],
          chatError: null,
          lastFailedMessage: null,
        })),
      toggleChecklistItem: (id) =>
        set((state) => {
          const next = new Set(state.completedChecklistIds)
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.add(id)
          }
          return { completedChecklistIds: Array.from(next) }
        }),
      setCompletedChecklistIds: (ids) => set({ completedChecklistIds: ids }),
      setProfile: (profile) => set({ profile }),
      setPlan: (plan, fetchedAt = plan ? Date.now() : null) =>
        set(() => ({
          plan,
          planFetchedAt: fetchedAt,
        })),
      hydrateFromStorage: () => {
        if (typeof window === "undefined") return
        const currentState = get()
        if (currentState.isHydrated) return

        const legacyProfile = localStorage.getItem(PROFILE_STORAGE_KEY)
        const legacyChat = localStorage.getItem(CHAT_STORAGE_KEY)
        const legacyPlan = localStorage.getItem(PLAN_STORAGE_KEY)

        set((state) => {
          const parsedChat = legacyChat ? safeParseJSON<ChatMessage[]>(legacyChat) : null
          const chatHistory = parsedChat?.length ? capHistory(parsedChat) : state.chatHistory
          const parsedProfile = legacyProfile ? safeParseJSON<UserProfile | ProfileData>(legacyProfile) : null
          const parsedPlan = legacyPlan ? safeParseJSON<PlanResponse>(legacyPlan) : null

          return {
            profile: parsedProfile ?? state.profile,
            plan: parsedPlan ?? state.plan,
            planFetchedAt: state.planFetchedAt ?? (parsedPlan ? Date.now() : state.planFetchedAt),
            chatHistory,
            isHydrated: true,
          }
        })
      },
      syncPlan: async () => {
        if (typeof window === "undefined") return
        const state = get()
        if (!state.profile || state.isFetchingPlan) return

        const isStale =
          !state.plan ||
          !state.planFetchedAt ||
          Date.now() - state.planFetchedAt > PLAN_SYNC_THRESHOLD_MS

        if (!isStale) return

        set({ isFetchingPlan: true, planError: null })
        try {
          const freshPlan = await apiClient.generatePlan(state.profile as ProfileData)
          set({
            plan: freshPlan,
            planFetchedAt: Date.now(),
            planError: null,
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to refresh plan"
          set({ planError: message })
        } finally {
          set({ isFetchingPlan: false })
        }
      },
      setChatError: (message) => set({ chatError: message }),
      setLastFailedMessage: (message) => set({ lastFailedMessage: message }),
      setRetryAvailableAt: (timestamp) => set({ retryAvailableAt: timestamp }),
    }),
    {
      name: PERSISTENCE_KEY,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (noopStorage as Storage) : localStorage,
      ),
      partialize: (state) => ({
        profile: state.profile,
        plan: state.plan,
        planFetchedAt: state.planFetchedAt,
        chatHistory: state.chatHistory,
        lastFailedMessage: state.lastFailedMessage,
        completedChecklistIds: state.completedChecklistIds,
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
