"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, FileText, Calendar, MessageSquare, ArrowRight } from "lucide-react"

const tourSteps = [
  {
    title: "Welcome to VisaVerse",
    description: "Your AI-powered copilot for global mobility. Let's take a quick tour of what you can do.",
    icon: CheckCircle2,
    color: "text-primary",
  },
  {
    title: "Complete Your Profile",
    description: "Start by answering a few questions about your move. The wizard will guide you through each step.",
    icon: FileText,
    color: "text-accent",
  },
  {
    title: "View Your Custom Plan",
    description: "Get a personalized mobility plan with timeline, checklist, documents, and risk analysis.",
    icon: Calendar,
    color: "text-success",
  },
  {
    title: "Chat with AI Copilot",
    description: "Have questions? Use the chat feature to get instant answers about your visa and relocation.",
    icon: MessageSquare,
    color: "text-primary",
  },
]

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("visaverse_tour_completed")
    if (!hasSeenTour) {
      setTimeout(() => setOpen(true), 500)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    localStorage.setItem("visaverse_tour_completed", "true")
    setOpen(false)
  }

  const handleComplete = () => {
    localStorage.setItem("visaverse_tour_completed", "true")
    setOpen(false)
  }

  const step = tourSteps[currentStep]
  const Icon = step.icon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div
            className={`w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mb-4 mx-auto`}
          >
            <Icon className={`w-8 h-8 ${step.color}`} />
          </div>
          <DialogTitle className="text-center text-2xl">{step.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">{step.description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 py-4">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? "w-8 bg-primary" : "w-2 bg-border"
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button variant="ghost" onClick={handleSkip} className="flex-1">
            Skip Tour
          </Button>
          <Button onClick={handleNext} className="flex-1 gap-2">
            {currentStep < tourSteps.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
