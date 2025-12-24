"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { OnboardingTour } from "@/components/onboarding-tour"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { SkipToContent } from "@/components/skip-to-content"
import { CheckCircle2, FileText, Calendar, Shield, ArrowRight } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const featureIcons = [FileText, Calendar, CheckCircle2, Shield] as const

export default function HomePage() {
  const { messages } = useI18n()
  const home = messages.home
  return (
    <div className="min-h-screen bg-background">
      <SkipToContent />
      <Navbar />
      <OnboardingTour />
      <PWAInstallPrompt />

      {/* Hero Section */}
      <main id="main-content">
        <section className="pt-32 pb-20 px-6 animate-in fade-in duration-700" aria-labelledby="hero-heading">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              id="hero-heading"
              className="text-5xl md:text-6xl font-semibold text-foreground mb-6 text-balance animate-in slide-in-from-bottom-4 duration-700"
            >
              {home.heroTitle}
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty animate-in slide-in-from-bottom-4 duration-700 delay-150">
              {home.heroSubtitle}
            </p>
            <Link href="/onboarding" className="animate-in slide-in-from-bottom-4 duration-700 delay-300 inline-block">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground h-12 px-8 text-base transition-all"
              >
                {home.heroCta}
                <ArrowRight
                  className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-card" aria-labelledby="features-heading">
          <div className="max-w-6xl mx-auto">
            <h2
              id="features-heading"
              className="text-3xl font-semibold text-center text-foreground mb-12 animate-in fade-in duration-700"
            >
              {home.featuresTitle}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {home.features.map((feature, index) => {
                const Icon = featureIcons[index] ?? FileText
                const delayMs = `${100 * (index + 1)}ms`
                return (
                  <Card
                    key={feature.title}
                    className="p-6 border-border hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4"
                    style={{ animationDelay: delayMs }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 transition-colors hover:bg-primary/20"
                      aria-hidden="true"
                    >
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-20 px-6" aria-labelledby="tips-heading">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-3xl p-8 md:p-12 border border-border hover:shadow-lg transition-shadow">
              <h2 id="tips-heading" className="text-2xl font-semibold text-foreground mb-6">
                {home.tipsTitle}
              </h2>
              <ul className="space-y-4" role="list">
                {home.tips.map((tip) => (
                  <li key={tip} className="flex gap-3 group">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"
                      aria-hidden="true"
                    />
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                      {tip}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-card" aria-labelledby="cta-heading">
          <div className="max-w-3xl mx-auto text-center animate-in fade-in duration-700">
            <h2 id="cta-heading" className="text-3xl font-semibold text-foreground mb-4">
              {home.ctaTitle}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">{home.ctaSubtitle}</p>
            <Link href="/onboarding">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground h-12 px-8 text-base transition-all"
              >
                {home.ctaButton}
                <ArrowRight
                  className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
