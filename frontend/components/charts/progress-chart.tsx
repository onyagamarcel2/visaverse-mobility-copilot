"use client"

import { Card } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface ProgressChartProps {
  completed: number
  total: number
  title: string
  description?: string
}

export function ProgressChart({ completed, total, title, description }: ProgressChartProps) {
  const percentage = Math.round((completed / total) * 100)
  const remaining = total - completed

  const data = [
    { name: "Completed", value: completed, color: "hsl(var(--primary))" },
    { name: "Remaining", value: remaining, color: "hsl(var(--muted))" },
  ]

  return (
    <Card className="p-6 border-border">
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}

      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1">
          <div className="text-3xl font-bold text-primary mb-1">{percentage}%</div>
          <p className="text-sm text-muted-foreground">
            {completed} of {total} items completed
          </p>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-xs text-muted-foreground">Remaining</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
