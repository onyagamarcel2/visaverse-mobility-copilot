"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, ShieldAlert, Info } from "lucide-react"

export function RisksTab() {
  const risks = [
    {
      title: "Insufficient Processing Time",
      severity: "high",
      description: "If you apply too close to your departure date, you may not receive your visa in time.",
      mitigation: [
        "Apply at least 8-10 weeks before your planned departure",
        "Consider expedited processing if available",
        "Book refundable travel tickets",
      ],
    },
    {
      title: "Incomplete Documentation",
      severity: "high",
      description: "Missing or incomplete documents are the most common reason for visa delays or rejections.",
      mitigation: [
        "Review document checklist thoroughly",
        "Have all documents translated and notarized where required",
        "Submit certified copies rather than originals when possible",
      ],
    },
    {
      title: "Insufficient Proof of Funds",
      severity: "medium",
      description: "You need to demonstrate you can financially support yourself during your stay.",
      mitigation: [
        "Maintain required minimum balance for 3-6 months",
        "Provide multiple sources of financial proof",
        "Include sponsor documents if applicable",
      ],
    },
    {
      title: "Previous Visa Violations",
      severity: "medium",
      description: "Past overstays or visa violations can affect your application.",
      mitigation: [
        "Be transparent about previous travel history",
        "Provide explanations for any irregularities",
        "Consider legal consultation if needed",
      ],
    },
    {
      title: "Passport Validity Issues",
      severity: "low",
      description: "Your passport must be valid for at least 6 months beyond your planned return date.",
      mitigation: [
        "Renew passport if expiry is within 6 months of return",
        "Allow 4-6 weeks for passport renewal",
        "Ensure passport has blank pages",
      ],
    },
  ]

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
            <h3 className="font-semibold text-foreground mb-2">Risk Assessment</h3>
            <p className="text-sm text-muted-foreground">
              We've identified potential challenges based on your profile. Review these risks and follow the mitigation
              strategies to improve your chances of success.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {risks.map((risk, index) => {
          const colors = getSeverityColor(risk.severity)
          return (
            <Card key={index} className="p-6 border-border">
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
                  <h4 className="text-sm font-semibold text-foreground">Mitigation Strategies</h4>
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
