"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type Locale = "en" | "fr"

const STORAGE_KEY = "visaverse_locale"

type Dictionary = Record<string, any>

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  messages: Dictionary
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

const translations: Record<Locale, Dictionary> = {
  en: {
    common: {
      getStarted: "Get Started",
      previous: "Previous",
      next: "Next",
      submit: "Generate Plan",
      editDetails: "Edit Details",
      share: "Share",
      exportPdf: "Export PDF",
      clearChat: "Clear Chat",
    },
    navbar: {
      brand: "VisaVerse",
    },
    onboarding: {
      title: "Build Your Mobility Plan",
      subtitle: "Tell us about your journey and we will create a personalized plan for you.",
      tipsTitle: "Helpful Tips",
      whatYouGet: "What You Will Get",
      tips: [
        "Typical visa processing takes 4–8 weeks",
        "Make sure your passport is valid 6+ months after departure",
        "Have digital copies of all documents ready",
        "Consider travel insurance early in the process",
      ],
      deliverables: [
        "Personalized document checklist",
        "Smart timeline with milestones",
        "Step-by-step action items",
        "Risk analysis and mitigation",
      ],
      wizard: {
        steps: [
          { title: "Basic Details", description: "Where are you going?" },
          { title: "Travel Info", description: "When and why?" },
          { title: "Additional Details", description: "Financial & other info" },
        ],
        labels: {
          originCountry: "Origin country",
          destinationCountry: "Destination country",
          purpose: "Purpose",
          departureDate: "Departure date",
          duration: "Duration (months)",
          passportExpiry: "Passport expiry date",
          hasSponsor: "Do you have a sponsor?",
          fundsLevel: "Proof of funds",
          language: "Language preference",
          notes: "Notes for your copilot",
        },
        placeholders: {
          originCountry: "e.g., Cameroon",
          destinationCountry: "e.g., France",
          duration: "How long will you stay?",
          notes: "Any special circumstances we should know?",
        },
        errors: {
          originCountry: "Please select your origin country",
          destinationCountry: "Please select your destination",
          destinationSame: "Destination must be different from origin",
          purpose: "Please select your travel purpose",
          departureDate: "Please select a departure date",
          departureFuture: "Departure date must be in the future",
          duration: "Please enter the duration",
          passportExpiry: "Please enter your passport expiry date",
          fundsLevel: "Please select your funds level",
        },
        toggles: {
          yes: "Yes",
          no: "No",
        },
      },
    },
    plan: {
      breadcrumb: {
        home: "Home",
        onboarding: "Onboarding",
        current: "Your Plan",
      },
      title: "Your Mobility Plan",
      subtitle: "Personalized guidance for your journey",
      tabs: {
        summary: "Summary",
        timeline: "Timeline",
        checklist: "Checklist",
        documents: "Documents",
        risks: "Risks",
      },
      nav: {
        previous: "Previous",
        next: "Next",
      },
    },
    chat: {
      heroTitle: "Ask Your Copilot",
      heroSubtitle: "Get instant answers to your visa and relocation questions.",
      initialMessage:
        "Hello! I'm your VisaVerse assistant. I can help answer questions about your visa application, required documents, and travel planning. How can I help you today?",
      placeholder: "Type your question...",
      helper: "Press Enter to send, Shift+Enter for new line",
      emptyTitle: "Complete Your Profile First",
      emptyDescription: "To get personalized assistance from your AI copilot, please complete your onboarding profile first.",
      emptyAction: "Start Onboarding",
      suggestedLabel: "Suggested questions:",
      prompts: [
        "What if my passport expires soon?",
        "Do I need health insurance?",
        "When should I book my visa appointment?",
        "How much money do I need to show?",
        "What documents need translation?",
        "Can I expedite the process?",
      ],
      retryError: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
    },
  },
  fr: {
    common: {
      getStarted: "Commencer",
      previous: "Précédent",
      next: "Suivant",
      submit: "Générer le plan",
      editDetails: "Modifier",
      share: "Partager",
      exportPdf: "Exporter en PDF",
      clearChat: "Effacer la conversation",
    },
    navbar: {
      brand: "VisaVerse",
    },
    onboarding: {
      title: "Construisez votre plan de mobilité",
      subtitle: "Parlez-nous de votre parcours et nous créerons un plan personnalisé.",
      tipsTitle: "Conseils utiles",
      whatYouGet: "Ce que vous recevrez",
      tips: [
        "Le traitement d'un visa prend généralement 4 à 8 semaines",
        "Vérifiez que votre passeport est valide 6+ mois après le départ",
        "Préparez des copies numériques de vos documents",
        "Pensez à l'assurance voyage dès le début",
      ],
      deliverables: [
        "Liste de documents personnalisée",
        "Chronologie intelligente avec jalons",
        "Actions pas-à-pas",
        "Analyse des risques et mitigations",
      ],
      wizard: {
        steps: [
          { title: "Informations de base", description: "Où partez-vous ?" },
          { title: "Infos de voyage", description: "Quand et pourquoi ?" },
          { title: "Détails complémentaires", description: "Finances et autres infos" },
        ],
        labels: {
          originCountry: "Pays d'origine",
          destinationCountry: "Pays de destination",
          purpose: "Motif",
          departureDate: "Date de départ",
          duration: "Durée (mois)",
          passportExpiry: "Expiration du passeport",
          hasSponsor: "Avez-vous un sponsor ?",
          fundsLevel: "Niveau de fonds",
          language: "Langue préférée",
          notes: "Notes pour votre copilote",
        },
        placeholders: {
          originCountry: "ex: Cameroun",
          destinationCountry: "ex: France",
          duration: "Combien de temps resterez-vous ?",
          notes: "Circconstances particulières à mentionner ?",
        },
        errors: {
          originCountry: "Sélectionnez votre pays d'origine",
          destinationCountry: "Sélectionnez votre destination",
          destinationSame: "La destination doit être différente de l'origine",
          purpose: "Sélectionnez votre motif",
          departureDate: "Sélectionnez une date de départ",
          departureFuture: "La date de départ doit être dans le futur",
          duration: "Indiquez la durée",
          passportExpiry: "Indiquez la date d'expiration du passeport",
          fundsLevel: "Sélectionnez votre niveau de fonds",
        },
        toggles: {
          yes: "Oui",
          no: "Non",
        },
      },
    },
    plan: {
      breadcrumb: {
        home: "Accueil",
        onboarding: "Onboarding",
        current: "Votre plan",
      },
      title: "Votre plan de mobilité",
      subtitle: "Conseils personnalisés pour votre parcours",
      tabs: {
        summary: "Résumé",
        timeline: "Chronologie",
        checklist: "Checklist",
        documents: "Documents",
        risks: "Risques",
      },
      nav: {
        previous: "Précédent",
        next: "Suivant",
      },
    },
    chat: {
      heroTitle: "Posez vos questions",
      heroSubtitle: "Obtenez des réponses instantanées sur votre visa et votre installation.",
      initialMessage:
        "Bonjour ! Je suis votre assistant VisaVerse. Je peux répondre sur votre demande de visa, les documents requis et la planification du voyage. Comment puis-je vous aider aujourd'hui ?",
      placeholder: "Tapez votre question...",
      helper: "Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne",
      emptyTitle: "Complétez d'abord votre profil",
      emptyDescription: "Pour obtenir une assistance personnalisée, veuillez compléter votre profil d'onboarding.",
      emptyAction: "Commencer l'onboarding",
      suggestedLabel: "Questions suggérées :",
      prompts: [
        "Que faire si mon passeport expire bientôt ?",
        "Ai-je besoin d'une assurance santé ?",
        "Quand réserver mon rendez-vous visa ?",
        "Combien de fonds dois-je prouver ?",
        "Quels documents doivent être traduits ?",
        "Puis-je accélérer la procédure ?",
      ],
      retryError: "Désolé, je n'arrive pas à me connecter. Réessayez dans un instant.",
    },
  },
}

function resolveKey(locale: Locale, key: string): string {
  const parts = key.split(".")
  let current: any = translations[locale]
  for (const part of parts) {
    if (current && part in current) {
      current = current[part]
    } else {
      return key
    }
  }
  if (typeof current === "string") return current
  return Array.isArray(current) ? current.join(" ") : key
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null
      if (saved === "en" || saved === "fr") {
        return saved
      }
    }
    return "en"
  })

  const setLocale = (value: Locale) => {
    setLocaleState(value)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, value)
    }
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string) => resolveKey(locale, key),
      messages: translations[locale],
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return ctx
}
