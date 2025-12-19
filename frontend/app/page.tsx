import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { OnboardingTour } from "@/components/onboarding-tour"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { SkipToContent } from "@/components/skip-to-content"
import { CheckCircle2, FileText, Calendar, Shield, ArrowRight } from "lucide-react"

export default function HomePage() {
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
              Your AI Copilot for Global Mobility
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty animate-in slide-in-from-bottom-4 duration-700 delay-150">
              Plan your visa, documents, and relocation steps effortlessly with personalized AI-powered guidance.
            </p>
            <Link href="/onboarding" className="animate-in slide-in-from-bottom-4 duration-700 delay-300 inline-block">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground h-12 px-8 text-base transition-all"
              >
                Start Planning
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
              Everything you need for your journey
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 border-border hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 delay-100">
                <div
                  className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 transition-colors hover:bg-primary/20"
                  aria-hidden="true"
                >
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Document Checklist</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Get a personalized list of all required documents for your visa application.
                </p>
              </Card>

              <Card className="p-6 border-border hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 delay-200">
                <div
                  className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 transition-colors hover:bg-accent/20"
                  aria-hidden="true"
                >
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Smart Timeline</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  AI-generated timeline with milestones and deadlines for your relocation.
                </p>
              </Card>

              <Card className="p-6 border-border hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 delay-300">
                <div
                  className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mb-4 transition-colors hover:bg-success/20"
                  aria-hidden="true"
                >
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Step-by-Step Guide</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Clear action items with priority levels to keep you on track.
                </p>
              </Card>

              <Card className="p-6 border-border hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-4 delay-[400ms]">
                <div
                  className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4 transition-colors hover:bg-destructive/20"
                  aria-hidden="true"
                >
                  <Shield className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Risk Analysis</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Identify potential challenges and get mitigation strategies.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-20 px-6" aria-labelledby="tips-heading">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-3xl p-8 md:p-12 border border-border hover:shadow-lg transition-shadow">
              <h2 id="tips-heading" className="text-2xl font-semibold text-foreground mb-6">
                Helpful Tips
              </h2>
              <ul className="space-y-4" role="list">
                <li className="flex gap-3 group">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"
                    aria-hidden="true"
                  />
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                    Typical visa processing takes 4–8 weeks, so start your planning early.
                  </p>
                </li>
                <li className="flex gap-3 group">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"
                    aria-hidden="true"
                  />
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                    Make sure your passport is valid 6+ months after your planned departure date.
                  </p>
                </li>
                <li className="flex gap-3 group">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0 group-hover:scale-150 transition-transform"
                    aria-hidden="true"
                  />
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                    Keep digital copies of all your documents in a secure cloud storage.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-card" aria-labelledby="cta-heading">
          <div className="max-w-3xl mx-auto text-center animate-in fade-in duration-700">
            <h2 id="cta-heading" className="text-3xl font-semibold text-foreground mb-4">
              Ready to start your journey?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">Get your personalized mobility plan in minutes.</p>
            <Link href="/onboarding">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 hover:scale-105 text-primary-foreground h-12 px-8 text-base transition-all"
              >
                Create Your Plan
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
