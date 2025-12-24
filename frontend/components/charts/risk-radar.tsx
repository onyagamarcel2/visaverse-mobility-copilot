"use client"

import { Card } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"
import type { PlanResponse } from "@/lib/api"
import { useI18n } from "@/lib/i18n"

interface RiskRadarProps {
  risks: PlanResponse["risks"]
}

const SEVERITY_MAP: Record<string, number> = {
  high: 35,
  medium: 55,
  low: 75,
}

export function RiskRadar({ risks }: RiskRadarProps) {
  const { messages } = useI18n()
  const fallbackData = messages.plan.risks.radarFallback.map((label: string, index: number) => ({
    category: label,
    score: [45, 60, 55, 35, 65][index] ?? 55,
  }))
  const chartData =
    risks.length > 0
      ? risks.map((risk) => ({
          category: risk.title,
          score: SEVERITY_MAP[risk.severity] ?? 55,
        }))
      : fallbackData

  return (
    <Card className="p-6 border-border">
      <h3 className="font-semibold text-foreground mb-2">{messages.plan.risks.radarTitle}</h3>
      <p className="text-sm text-muted-foreground mb-4">{messages.plan.risks.radarSubtitle}</p>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Radar
              name={messages.plan.risks.radarPreparedness}
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">{item.category}</span>
            <span className="text-sm font-semibold text-foreground">{item.score}%</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
