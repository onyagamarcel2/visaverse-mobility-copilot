"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ShieldAlert, Info } from "lucide-react"
import type { PlanResponse } from "@/lib/api"
import { PlanNoData } from "@/components/plan/no-data"
import { useI18n } from "@/lib/i18n"

interface RisksTabProps {
  risks: PlanResponse["risks"]
}

export function RisksTab({ risks }: RisksTabProps) {
  const { messages } = useI18n()
  if (risks.length === 0) {
    return (
      <PlanNoData
        title={messages.plan.noData.risksTitle}
        description={messages.plan.noData.risksDescription}
      />
    )
  }

  const getSeverityColor = (severity: string) => {
    const colors = {
      high: { badge: "bg-destructive text-destructive-foreground", icon: "text-destructive" },
      medium: { badge: "bg-warning text-foreground", icon: "text-warning" },
      low: { badge: "bg-success text-white", icon: "text-success" },
    }
    return colors[severity as keyof typeof colors] || colors.low
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border bg-accent/5">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">{messages.plan.risks.assessmentTitle}</h3>
            <p className="text-sm text-muted-foreground">{messages.plan.risks.assessmentDescription}</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {risks.map((risk) => {
          const colors = getSeverityColor(risk.severity)
          return (
            <Card key={risk.title} className="p-6 border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                  <div>
                    <h3 className="font-semibold text-foreground">{risk.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{risk.description}</p>
                  </div>
                </div>
                <Badge className={colors.badge}>{risk.severity}</Badge>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-muted/50">
                <div className="flex items-start gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <h4 className="text-sm font-semibold text-foreground">{messages.plan.risks.mitigationTitle}</h4>
                </div>
                <ul className="space-y-2">
                  {risk.mitigation.map((strategy, strategyIndex) => (
                    <li key={strategyIndex} className="text-sm text-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
