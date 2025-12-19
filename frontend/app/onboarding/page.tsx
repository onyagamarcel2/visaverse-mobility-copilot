import { Navbar } from "@/components/navbar"
import { OnboardingWizard } from "@/components/onboarding-wizard"
import { Info } from "lucide-react"

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-foreground mb-3">Build Your Mobility Plan</h1>
            <p className="text-lg text-muted-foreground">
              Tell us about your journey and we'll create a personalized plan for you.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <OnboardingWizard />
            </div>

            {/* Sidebar Tips */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <h3 className="font-semibold text-foreground">Helpful Tips</h3>
                </div>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Typical visa processing takes 4–8 weeks</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Make sure your passport is valid 6+ months after departure</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Have digital copies of all documents ready</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Consider travel insurance early in the process</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-3">What You'll Get</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-success">✓</span>
                    <span>Personalized document checklist</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-success">✓</span>
                    <span>Smart timeline with milestones</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-success">✓</span>
                    <span>Step-by-step action items</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-success">✓</span>
                    <span>Risk analysis and mitigation</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
