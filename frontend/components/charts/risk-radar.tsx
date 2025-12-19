"use client"

import { Card } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts"

export function RiskRadar() {
  const data = [
    { category: "Financial", score: 85 },
    { category: "Documentation", score: 70 },
    { category: "Timeline", score: 60 },
    { category: "Legal", score: 90 },
    { category: "Health", score: 80 },
  ]

  return (
    <Card className="p-6 border-border">
      <h3 className="font-semibold text-foreground mb-2">Risk Assessment</h3>
      <p className="text-sm text-muted-foreground mb-4">Higher scores indicate better preparedness</p>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <Radar
              name="Preparedness"
              dataKey="score"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground">{item.category}</span>
            <span className="text-sm font-semibold text-foreground">{item.score}%</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
