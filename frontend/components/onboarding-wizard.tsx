"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { id: 1, title: "Basic Details", description: "Where are you going?" },
  { id: 2, title: "Travel Info", description: "When and why?" },
  { id: 3, title: "Additional Details", description: "Financial & other info" },
]

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    originCountry: "",
    destinationCountry: "",
    purpose: "",
    departureDate: "",
    duration: "",
    passportExpiry: "",
    hasSponsor: false,
    fundsLevel: "",
    language: "en",
    notes: "",
  })

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.originCountry) newErrors.originCountry = "Please select your origin country"
      if (!formData.destinationCountry) newErrors.destinationCountry = "Please select your destination"
      if (formData.originCountry === formData.destinationCountry) {
        newErrors.destinationCountry = "Destination must be different from origin"
      }
    }

    if (step === 2) {
      if (!formData.purpose) newErrors.purpose = "Please select your travel purpose"
      if (!formData.departureDate) newErrors.departureDate = "Please select a departure date"
      if (!formData.duration) newErrors.duration = "Please enter the duration"
      if (!formData.passportExpiry) newErrors.passportExpiry = "Please enter your passport expiry date"

      // Check if departure date is in the future
      if (formData.departureDate && new Date(formData.departureDate) < new Date()) {
        newErrors.departureDate = "Departure date must be in the future"
      }
    }

    if (step === 3) {
      if (!formData.fundsLevel) newErrors.fundsLevel = "Please select your funds level"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)

    // Save to localStorage (and sessionStorage as draft)
    localStorage.setItem("visaverse_profile", JSON.stringify(formData))
    sessionStorage.setItem("visaverse_draft", JSON.stringify(formData))

    await new Promise((resolve) => setTimeout(resolve, 2000))

    router.push("/plan")
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Section */}
      <div className="mb-8" role="region" aria-label="Onboarding progress">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
              Step {currentStep} of {STEPS.length}
            </p>
            <h2 className="text-2xl font-semibold text-foreground mt-1" id="step-title">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-muted-foreground mt-1">{STEPS[currentStep - 1].description}</p>
          </div>
        </div>
        <Progress value={progress} className="h-2" aria-label={`Progress: ${Math.round(progress)}%`} />

        {/* Step indicators */}
        <nav aria-label="Form steps" className="flex items-center gap-2 mt-4">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-2 flex-1",
                step.id < currentStep && "text-primary",
                step.id === currentStep && "text-foreground",
                step.id > currentStep && "text-muted-foreground",
              )}
              aria-current={step.id === currentStep ? "step" : undefined}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  step.id < currentStep && "bg-primary text-primary-foreground",
                  step.id === currentStep && "bg-primary/10 text-primary border-2 border-primary",
                  step.id > currentStep && "bg-muted text-muted-foreground",
                )}
                aria-label={`Step ${step.id}: ${step.title} ${step.id < currentStep ? "(completed)" : step.id === currentStep ? "(current)" : ""}`}
              >
                {step.id < currentStep ? <Check className="w-4 h-4" aria-hidden="true" /> : step.id}
              </div>
              <span className="text-xs font-medium hidden md:inline">{step.title}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* Form Card */}
      <Card className="p-8 border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (currentStep < STEPS.length) {
              handleNext()
            } else {
              handleSubmit()
            }
          }}
          aria-labelledby="step-title"
        >
          <div className="space-y-6">
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="originCountry">
                    Origin Country{" "}
                    <span className="text-destructive" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Select value={formData.originCountry} onValueChange={(value) => updateField("originCountry", value)}>
                    <SelectTrigger
                      id="originCountry"
                      className={errors.originCountry ? "border-red-500" : ""}
                      aria-invalid={!!errors.originCountry}
                      aria-describedby={errors.originCountry ? "originCountry-error" : undefined}
                    >
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="cn">China</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="br">Brazil</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.originCountry && (
                    <p className="text-sm text-red-500" id="originCountry-error" role="alert">
                      {errors.originCountry}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destinationCountry">
                    Destination Country{" "}
                    <span className="text-destructive" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Select
                    value={formData.destinationCountry}
                    onValueChange={(value) => updateField("destinationCountry", value)}
                  >
                    <SelectTrigger
                      id="destinationCountry"
                      className={errors.destinationCountry ? "border-red-500" : ""}
                      aria-invalid={!!errors.destinationCountry}
                      aria-describedby={errors.destinationCountry ? "destinationCountry-error" : undefined}
                    >
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="in">India</SelectItem>
                      <SelectItem value="cn">China</SelectItem>
                      <SelectItem value="jp">Japan</SelectItem>
                      <SelectItem value="br">Brazil</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.destinationCountry && (
                    <p className="text-sm text-red-500" id="destinationCountry-error" role="alert">
                      {errors.destinationCountry}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Travel Info */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="purpose">
                    Purpose of Travel{" "}
                    <span className="text-destructive" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Select value={formData.purpose} onValueChange={(value) => updateField("purpose", value)}>
                    <SelectTrigger
                      id="purpose"
                      className={errors.purpose ? "border-red-500" : ""}
                      aria-invalid={!!errors.purpose}
                      aria-describedby={errors.purpose ? "purpose-error" : undefined}
                    >
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="tourism">Tourism</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.purpose && (
                    <p className="text-sm text-red-500" id="purpose-error" role="alert">
                      {errors.purpose}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="departureDate">
                      Planned Departure Date{" "}
                      <span className="text-destructive" aria-label="required">
                        *
                      </span>
                    </Label>
                    <Input
                      id="departureDate"
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => updateField("departureDate", e.target.value)}
                      className={errors.departureDate ? "border-red-500" : ""}
                      aria-invalid={!!errors.departureDate}
                      aria-describedby={errors.departureDate ? "departureDate-error" : undefined}
                    />
                    {errors.departureDate && (
                      <p className="text-sm text-red-500" id="departureDate-error" role="alert">
                        {errors.departureDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">
                      Duration (months){" "}
                      <span className="text-destructive" aria-label="required">
                        *
                      </span>
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      placeholder="e.g., 6"
                      value={formData.duration}
                      onChange={(e) => updateField("duration", e.target.value)}
                      className={errors.duration ? "border-red-500" : ""}
                      aria-invalid={!!errors.duration}
                      aria-describedby={errors.duration ? "duration-error" : undefined}
                    />
                    {errors.duration && (
                      <p className="text-sm text-red-500" id="duration-error" role="alert">
                        {errors.duration}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passportExpiry">
                    Passport Expiry Date{" "}
                    <span className="text-destructive" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Input
                    id="passportExpiry"
                    type="date"
                    value={formData.passportExpiry}
                    onChange={(e) => updateField("passportExpiry", e.target.value)}
                    className={errors.passportExpiry ? "border-red-500" : ""}
                    aria-invalid={!!errors.passportExpiry}
                    aria-describedby={errors.passportExpiry ? "passportExpiry-error" : undefined}
                  />
                  {errors.passportExpiry && (
                    <p className="text-sm text-red-500" id="passportExpiry-error" role="alert">
                      {errors.passportExpiry}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Additional Details */}
            {currentStep === 3 && (
              <>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                  <div className="space-y-0.5">
                    <Label htmlFor="hasSponsor">Do you have a sponsor?</Label>
                    <p className="text-sm text-muted-foreground" id="hasSponsor-description">
                      Someone financially supporting your trip
                    </p>
                  </div>
                  <Switch
                    id="hasSponsor"
                    checked={formData.hasSponsor}
                    onCheckedChange={(checked) => updateField("hasSponsor", checked)}
                    aria-describedby="hasSponsor-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundsLevel">
                    Proof of Funds Level{" "}
                    <span className="text-destructive" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Select value={formData.fundsLevel} onValueChange={(value) => updateField("fundsLevel", value)}>
                    <SelectTrigger
                      id="fundsLevel"
                      className={errors.fundsLevel ? "border-red-500" : ""}
                      aria-invalid={!!errors.fundsLevel}
                      aria-describedby={errors.fundsLevel ? "fundsLevel-error" : undefined}
                    >
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Basic requirements)</SelectItem>
                      <SelectItem value="medium">Medium (Comfortable)</SelectItem>
                      <SelectItem value="high">High (Abundant)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.fundsLevel && (
                    <p className="text-sm text-red-500" id="fundsLevel-error" role="alert">
                      {errors.fundsLevel}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select value={formData.language} onValueChange={(value) => updateField("language", value)}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special circumstances or questions..."
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={4}
                    aria-describedby="notes-description"
                  />
                  <p className="text-xs text-muted-foreground" id="notes-description">
                    Include any special circumstances or questions you have about your travel
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              className="gap-2 bg-transparent"
              aria-label="Go to previous step"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              Back
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" aria-label="Go to next step">
                Next
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="gap-2 bg-primary hover:bg-primary/90"
                aria-label="Generate your mobility plan"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span aria-live="polite">Generating Plan...</span>
                  </>
                ) : (
                  <>
                    Generate Plan
                    <Check className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}
