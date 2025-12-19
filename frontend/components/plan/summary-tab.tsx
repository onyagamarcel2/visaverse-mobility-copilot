"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe, Calendar, Target, AlertCircle } from "lucide-react"
import { ProgressChart } from "@/components/charts/progress-chart"
import { RiskRadar } from "@/components/charts/risk-radar"

interface SummaryTabProps {
  profile: {
    originCountry: string
    destinationCountry: string
    purpose: string
    departureDate: string
    duration: string
  }
}

export function SummaryTab({ profile }: SummaryTabProps) {
  const getCountryName = (code: string) => {
    const countries: Record<string, string> = {
      us: "United States",
      uk: "United Kingdom",
      ca: "Canada",
      au: "Australia",
      de: "Germany",
      fr: "France",
      in: "India",
      cn: "China",
      jp: "Japan",
      br: "Brazil",
    }
    return countries[code] || code
  }

  const getPurposeLabel = (purpose: string) => {
    const labels: Record<string, string> = {
      study: "Study",
      work: "Work",
      tourism: "Tourism",
      family: "Family Reunion",
      business: "Business",
    }
    return labels[purpose] || purpose
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="p-6 border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Plan Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Route</p>
                <p className="font-medium text-foreground">
                  {getCountryName(profile.originCountry)} → {getCountryName(profile.destinationCountry)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Purpose</p>
                <p className="font-medium text-foreground">{getPurposeLabel(profile.purpose)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Departure</p>
                <p className="font-medium text-foreground">
                  {new Date(profile.departureDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium text-foreground">{profile.duration} months</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Visualization Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <ProgressChart
          completed={5}
          total={12}
          title="Document Collection"
          description="Track your progress gathering required documents"
        />
        <ProgressChart
          completed={3}
          total={8}
          title="Action Items"
          description="Complete these tasks before your departure"
        />
      </div>

      <RiskRadar />

      {/* Key Insights */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 border-border">
          <div className="text-center">
            <p className="text-3xl font-semibold text-primary mb-1">12</p>
            <p className="text-sm text-muted-foreground">Documents Required</p>
          </div>
        </Card>
        <Card className="p-6 border-border">
          <div className="text-center">
            <p className="text-3xl font-semibold text-accent mb-1">8</p>
            <p className="text-sm text-muted-foreground">Action Items</p>
          </div>
        </Card>
        <Card className="p-6 border-border">
          <div className="text-center">
            <p className="text-3xl font-semibold text-success mb-1">6-8</p>
            <p className="text-sm text-muted-foreground">Weeks Estimated</p>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6 border-border">
        <h3 className="font-semibold text-foreground mb-4">Personalized Recommendations</h3>
        <div className="space-y-3">
          <div className="flex gap-3 p-3 rounded-lg bg-success/10">
            <Badge className="bg-success text-white h-fit">Low Risk</Badge>
            <p className="text-sm text-foreground">
              Your passport expiry date provides sufficient validity for this trip.
            </p>
          </div>
          <div className="flex gap-3 p-3 rounded-lg bg-warning/10">
            <Badge className="bg-warning text-foreground h-fit">Action Needed</Badge>
            <p className="text-sm text-foreground">
              Begin gathering financial documents at least 4 weeks before your visa application.
            </p>
          </div>
          <div className="flex gap-3 p-3 rounded-lg bg-accent/10">
            <Badge className="bg-accent text-white h-fit">Tip</Badge>
            <p className="text-sm text-foreground">
              Consider scheduling your visa appointment 6-8 weeks before departure for optimal timing.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
