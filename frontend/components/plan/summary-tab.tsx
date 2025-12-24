"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Calendar, Target, AlertCircle } from "lucide-react"
import { ProgressChart } from "@/components/charts/progress-chart"
import { RiskRadar } from "@/components/charts/risk-radar"
import { PlanNoData } from "@/components/plan/no-data"
import type { PlanResponse, ProfileData } from "@/lib/api"
import { useI18n } from "@/lib/i18n"

interface SummaryTabProps {
  profile: ProfileData
  plan: PlanResponse
}

const RECOMMENDATION_COLORS = ["bg-success/10", "bg-warning/10", "bg-accent/10"]

export function SummaryTab({ profile, plan }: SummaryTabProps) {
  const { messages } = useI18n()
  const countryOptions = messages.onboarding.options.countries
  const purposeOptions = messages.onboarding.options.purposes
  const confidencePercent = Math.round((plan.summary.confidence || 0) * 100)
  const resolvedDocuments = plan.summary.totalDocuments || plan.documents.length
  const resolvedTasks = plan.summary.totalTasks || plan.timeline.length

  const getCountryName = (code: string) => {
    const match = countryOptions.find((country: { value: string; label: string }) => country.value === code.toLowerCase())
    return match ? match.label : code
  }

  const getPurposeLabel = (purpose: string) => {
    const match = purposeOptions.find((item: { value: string; label: string }) => item.value === purpose)
    return match ? match.label : purpose
  }

  const formattedDeparture = profile.departureDate
    ? new Date(profile.departureDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : messages.plan.summary.tbd

  const documentProgressCompleted = Math.min(resolvedDocuments, Math.max(0, Math.round(resolvedDocuments * 0.15)))
  const taskProgressCompleted = Math.min(resolvedTasks, Math.max(0, Math.round(resolvedTasks * 0.1)))

  const recommendations = plan.risks.slice(0, 3).map((risk) => ({
    title: risk.title,
    description: risk.description,
    severity: risk.severity,
  }))

  const severityBadge = (severity: string) => {
    if (severity === "high") {
      return <Badge className="bg-destructive text-destructive-foreground h-fit">{messages.plan.summary.severityHigh}</Badge>
    }
    if (severity === "medium") {
      return <Badge className="bg-warning text-foreground h-fit">{messages.plan.summary.severityMedium}</Badge>
    }
    return <Badge className="bg-accent text-white h-fit">{messages.plan.summary.severityLow}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="p-6 border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">{messages.plan.summary.overviewTitle}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{messages.plan.summary.routeLabel}</p>
                <p className="font-medium text-foreground">
                  {getCountryName(profile.originCountry)} → {getCountryName(profile.destinationCountry)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{messages.plan.summary.purposeLabel}</p>
                <p className="font-medium text-foreground">{getPurposeLabel(profile.purpose)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{messages.plan.summary.departureLabel}</p>
                <p className="font-medium text-foreground">{formattedDeparture}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">{messages.plan.summary.durationLabel}</p>
                <p className="font-medium text-foreground">
                  {profile.duration} {messages.plan.summary.durationMonths}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-4 bg-primary/5 border-border flex flex-col">
            <span className="text-sm text-muted-foreground">{messages.plan.summary.confidenceLabel}</span>
            <span className="text-3xl font-semibold text-primary mt-2">{confidencePercent}%</span>
            <p className="text-xs text-muted-foreground mt-1">{messages.plan.summary.confidenceHint}</p>
          </Card>
          <Card className="p-4 border-border flex flex-col">
            <span className="text-sm text-muted-foreground">{messages.plan.summary.estimatedWeeksLabel}</span>
            <span className="text-3xl font-semibold text-foreground mt-2">{plan.summary.estimatedWeeks}</span>
            <p className="text-xs text-muted-foreground mt-1">{messages.plan.summary.estimatedWeeksHint}</p>
          </Card>
          <Card className="p-4 border-border flex flex-col">
            <span className="text-sm text-muted-foreground">{messages.plan.summary.documentsCountLabel}</span>
            <span className="text-3xl font-semibold text-foreground mt-2">{resolvedDocuments}</span>
            <p className="text-xs text-muted-foreground mt-1">{messages.plan.summary.documentsCountHint}</p>
          </Card>
        </div>
      </Card>

      {/* Data Visualization Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <ProgressChart
          completed={documentProgressCompleted}
          total={Math.max(resolvedDocuments, 1)}
          title={messages.plan.summary.documentCollectionTitle}
          description={messages.plan.summary.documentCollectionDescription}
        />
        <ProgressChart
          completed={taskProgressCompleted}
          total={Math.max(resolvedTasks, 1)}
          title={messages.plan.summary.actionItemsTitle}
          description={messages.plan.summary.actionItemsDescription}
        />
      </div>

      <RiskRadar risks={plan.risks} />

      {/* Key Insights */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 border-border">
          <div className="text-center">
            <p className="text-3xl font-semibold text-primary mb-1">{resolvedDocuments}</p>
            <p className="text-sm text-muted-foreground">{messages.plan.summary.documentsRequiredLabel}</p>
          </div>
        </Card>
        <Card className="p-6 border-border">
          <div className="text-center">
            <p className="text-3xl font-semibold text-accent mb-1">{resolvedTasks}</p>
            <p className="text-sm text-muted-foreground">{messages.plan.summary.actionItemsLabel}</p>
          </div>
        </Card>
        <Card className="p-6 border-border">
          <div className="text-center">
            <p className="text-3xl font-semibold text-success mb-1">{plan.summary.estimatedWeeks}</p>
            <p className="text-sm text-muted-foreground">{messages.plan.summary.weeksEstimatedLabel}</p>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6 border-border">
        <h3 className="font-semibold text-foreground mb-4">{messages.plan.summary.recommendationsTitle}</h3>
        {recommendations.length === 0 ? (
          <PlanNoData
            title={messages.plan.noData.recommendationsTitle}
            description={messages.plan.noData.recommendationsDescription}
          />
        ) : (
          <div className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <div
                key={recommendation.title}
                className={`flex gap-3 p-3 rounded-lg ${RECOMMENDATION_COLORS[index] ?? "bg-muted/50"}`}
              >
                {severityBadge(recommendation.severity)}
                <div>
                  <p className="text-sm font-semibold text-foreground">{recommendation.title}</p>
                  <p className="text-sm text-muted-foreground">{recommendation.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
