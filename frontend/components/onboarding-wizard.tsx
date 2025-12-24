"use client"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, ChevronLeft, Check, Loader2, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/lib/store"

const PURPOSE_OPTIONS = ["study", "work", "tourism", "family", "business"] as const
const FUNDS_OPTIONS = ["low", "medium", "high"] as const
const LANGUAGE_OPTIONS = ["en", "fr"] as const

export function OnboardingWizard() {
  const { t, messages, locale } = useI18n()
  const STEPS = messages.onboarding.wizard.steps.map((step: any, idx: number) => ({
    id: idx + 1,
    title: step.title,
    description: step.description,
  }))
  const countryOptions = messages.onboarding.options.countries
  const purposeOptions = messages.onboarding.options.purposes
  const fundsOptions = messages.onboarding.options.funds
  const languageOptions = messages.onboarding.options.languages
  const router = useRouter()
  const { toast } = useToast()
  const setProfile = useAppStore((state) => state.setProfile)
  const setPlan = useAppStore((state) => state.setPlan)
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
    language: locale,
    notes: "",
  })
  const [languageTouched, setLanguageTouched] = useState(false)

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [field]: "" }))
    if (field === "language") {
      setLanguageTouched(true)
    }
  }
  useEffect(() => {
    if (!languageTouched) {
      setFormData((prev) => ({ ...prev, language: locale }))
    }
  }, [locale, languageTouched])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    const countryValues = new Set(countryOptions.map((country: { value: string }) => country.value))

    if (step === 1) {
      if (!formData.originCountry) newErrors.originCountry = t("onboarding.wizard.errors.originCountry")
      if (formData.originCountry && !countryValues.has(formData.originCountry)) {
        newErrors.originCountry = t("onboarding.wizard.errors.originCountryInvalid")
      }
      if (!formData.destinationCountry) newErrors.destinationCountry = t("onboarding.wizard.errors.destinationCountry")
      if (formData.destinationCountry && !countryValues.has(formData.destinationCountry)) {
        newErrors.destinationCountry = t("onboarding.wizard.errors.destinationCountryInvalid")
      }
      if (formData.originCountry === formData.destinationCountry) {
        newErrors.destinationCountry = t("onboarding.wizard.errors.destinationSame")
      }
    }

    if (step === 2) {
      if (!formData.purpose) newErrors.purpose = t("onboarding.wizard.errors.purpose")
      if (formData.purpose && !PURPOSE_OPTIONS.includes(formData.purpose as (typeof PURPOSE_OPTIONS)[number])) {
        newErrors.purpose = t("onboarding.wizard.errors.purposeInvalid")
      }
      if (!formData.departureDate) newErrors.departureDate = t("onboarding.wizard.errors.departureDate")
      if (!formData.duration) newErrors.duration = t("onboarding.wizard.errors.duration")
      if (!formData.passportExpiry) newErrors.passportExpiry = t("onboarding.wizard.errors.passportExpiry")

      // Check if departure date is in the future
      if (formData.departureDate && new Date(formData.departureDate) < new Date()) {
        newErrors.departureDate = t("onboarding.wizard.errors.departureFuture")
      }

      const durationValue = Number(formData.duration)
      if (formData.duration && (!Number.isFinite(durationValue) || durationValue <= 0)) {
        newErrors.duration = t("onboarding.wizard.errors.durationInvalid")
      }

      if (formData.departureDate && formData.passportExpiry) {
        const departure = new Date(formData.departureDate)
        const expiry = new Date(formData.passportExpiry)
        if (expiry <= departure) {
          newErrors.passportExpiry = t("onboarding.wizard.errors.passportBeforeDeparture")
        }
      }
    }

    if (step === 3) {
      if (!formData.fundsLevel) newErrors.fundsLevel = t("onboarding.wizard.errors.fundsLevel")
      if (formData.fundsLevel && !FUNDS_OPTIONS.includes(formData.fundsLevel as (typeof FUNDS_OPTIONS)[number])) {
        newErrors.fundsLevel = t("onboarding.wizard.errors.fundsLevelInvalid")
      }
      if (formData.language && !LANGUAGE_OPTIONS.includes(formData.language as (typeof LANGUAGE_OPTIONS)[number])) {
        newErrors.language = t("onboarding.wizard.errors.languageInvalid")
      }
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

  const profilePayload = useMemo(
    () => ({
      ...formData,
      duration: formData.duration.trim(),
      notes: formData.notes.trim(),
    }),
    [formData],
  )

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setLoading(true)
    sessionStorage.setItem("visaverse_draft", JSON.stringify(formData))

    try {
      const plan = await apiClient.generatePlan(profilePayload)
      setProfile(profilePayload)
      setPlan(plan)
      toast({
        title: t("onboarding.wizard.success.title"),
        description: t("onboarding.wizard.success.description"),
      })
      router.push("/plan")
    } catch (error) {
      const message = error instanceof Error ? error.message : t("onboarding.wizard.errors.generic")
      toast({
        title: t("onboarding.wizard.errors.submitTitle"),
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const progress = (currentStep / STEPS.length) * 100
  const today = useMemo(() => new Date(), [])
  const localeTag = locale === "fr" ? "fr-FR" : "en-US"
  const formatDate = (value?: string) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""
    return date.toLocaleDateString(localeTag, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  const selectedDeparture = formData.departureDate ? new Date(formData.departureDate) : undefined
  const selectedPassportExpiry = formData.passportExpiry ? new Date(formData.passportExpiry) : undefined

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Section */}
      <div className="mb-8" role="region" aria-label="Onboarding progress">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
              {`Step ${currentStep} / ${STEPS.length}`}
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
                    {t("onboarding.wizard.labels.originCountry")}{" "}
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
                      <SelectValue placeholder={t("onboarding.wizard.placeholders.originCountry") || ""} />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country: { value: string; label: string }) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
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
                    {t("onboarding.wizard.labels.destinationCountry")}{" "}
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
                      <SelectValue placeholder={t("onboarding.wizard.placeholders.destinationCountry") || ""} />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country: { value: string; label: string }) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
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
                    {t("onboarding.wizard.labels.purpose")} {" "}
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
                      <SelectValue placeholder={t("onboarding.wizard.labels.purpose")} />
                    </SelectTrigger>
                    <SelectContent>
                      {purposeOptions.map((purpose: { value: string; label: string }) => (
                        <SelectItem key={purpose.value} value={purpose.value}>
                          {purpose.label}
                        </SelectItem>
                      ))}
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
                      {t("onboarding.wizard.labels.departureDate")} {" "}
                      <span className="text-destructive" aria-label="required">
                        *
                      </span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-between text-left font-normal",
                            !formData.departureDate && "text-muted-foreground",
                            errors.departureDate && "border-red-500",
                          )}
                          aria-invalid={!!errors.departureDate}
                          aria-describedby={errors.departureDate ? "departureDate-error" : undefined}
                        >
                          <span>
                            {formData.departureDate
                              ? formatDate(formData.departureDate)
                              : t("onboarding.wizard.labels.departureDate")}
                          </span>
                          <CalendarIcon className="h-4 w-4 opacity-70" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDeparture}
                          onSelect={(date) =>
                            updateField("departureDate", date ? date.toISOString().slice(0, 10) : "")
                          }
                          disabled={{ before: today }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.departureDate && (
                      <p className="text-sm text-red-500" id="departureDate-error" role="alert">
                        {errors.departureDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">
                      {t("onboarding.wizard.labels.duration")} {" "}
                      <span className="text-destructive" aria-label="required">
                        *
                      </span>
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      placeholder={t("onboarding.wizard.placeholders.duration")}
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
                    {t("onboarding.wizard.labels.passportExpiry")} {" "}
                    <span className="text-destructive" aria-label="required">
                      *
                    </span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-between text-left font-normal",
                          !formData.passportExpiry && "text-muted-foreground",
                          errors.passportExpiry && "border-red-500",
                        )}
                        aria-invalid={!!errors.passportExpiry}
                        aria-describedby={errors.passportExpiry ? "passportExpiry-error" : undefined}
                      >
                        <span>
                          {formData.passportExpiry
                            ? formatDate(formData.passportExpiry)
                            : t("onboarding.wizard.labels.passportExpiry")}
                        </span>
                        <CalendarIcon className="h-4 w-4 opacity-70" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedPassportExpiry}
                        onSelect={(date) =>
                          updateField("passportExpiry", date ? date.toISOString().slice(0, 10) : "")
                        }
                        disabled={{ before: today }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                    <Label htmlFor="hasSponsor">{t("onboarding.wizard.labels.hasSponsor")}</Label>
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
                    {t("onboarding.wizard.labels.fundsLevel")} {" "}
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
                      <SelectValue placeholder={t("onboarding.wizard.labels.fundsLevel") || ""} />
                    </SelectTrigger>
                    <SelectContent>
                      {fundsOptions.map((fund: { value: string; label: string }) => (
                        <SelectItem key={fund.value} value={fund.value}>
                          {fund.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.fundsLevel && (
                    <p className="text-sm text-red-500" id="fundsLevel-error" role="alert">
                      {errors.fundsLevel}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">{t("onboarding.wizard.labels.language")}</Label>
                  <Select value={formData.language} onValueChange={(value) => updateField("language", value)}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder={t("onboarding.wizard.labels.language") || ""} />
                    </SelectTrigger>
                    <SelectContent>
                      {languageOptions.map((language: { value: string; label: string }) => (
                        <SelectItem key={language.value} value={language.value}>
                          {language.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">{t("onboarding.wizard.labels.notes")}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t("onboarding.wizard.placeholders.notes")}
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
              {t("common.previous")}
            </Button>

            {currentStep < STEPS.length ? (
              <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90" aria-label="Go to next step">
                {t("common.next")}
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
                    <span aria-live="polite">{t("common.submit")}</span>
                  </>
                ) : (
                  <>
                    {t("common.submit")}
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
