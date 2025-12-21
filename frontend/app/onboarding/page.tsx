"use client"

import { Navbar } from "@/components/navbar"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { Info } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function OnboardingPage() {
  const { t, messages } = useI18n()
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-foreground mb-3">{t("onboarding.title")}</h1>
            <p className="text-lg text-muted-foreground">{t("onboarding.subtitle")}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <OnboardingWizard />
            </div>

            {/* Sidebar Tips */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6" aria-labelledby="tips-heading">
                <div className="flex items-start gap-3 mb-4">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-foreground" id="tips-heading">
                    {t("onboarding.tipsTitle")}
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {messages.onboarding.tips.map((tip: string, index: number) => (
                    <li key={tip} className="flex gap-2">
                      <span className="text-primary" aria-hidden>
                        •
                      </span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6" aria-labelledby="deliverables-heading">
                <h3 className="font-semibold text-foreground mb-3" id="deliverables-heading">
                  {t("onboarding.whatYouGet")}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {messages.onboarding.deliverables.map((item: string) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-success" aria-hidden>
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
