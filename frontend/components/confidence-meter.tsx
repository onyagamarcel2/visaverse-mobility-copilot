"use client"

interface ConfidenceMeterProps {
  confidence: number // 0-1 scale
}

export function ConfidenceMeter({ confidence }: ConfidenceMeterProps) {
  const percentage = Math.round(confidence * 100)
  const getColor = () => {
    if (confidence >= 0.8) return "bg-success"
    if (confidence >= 0.6) return "bg-warning"
    return "bg-destructive"
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Plan Confidence</span>
        <span className="text-sm font-semibold text-foreground">{percentage}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${getColor()} transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
