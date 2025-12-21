import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const highlights = [
  { title: "KB Workflow", description: "Draft → Review → Publish with audit trail" },
  { title: "Rules", description: "Versioned rule sets with simulators" },
  { title: "Observability", description: "Runs, feedback, and metrics" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Overview</p>
        <h1 className="text-3xl font-semibold">Control Plane</h1>
        <p className="text-muted-foreground max-w-3xl">
          Administer knowledge, rules, prompts, and compliance controls without disrupting the end-user experience.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.title} className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {item.title}
                <Badge variant="secondary">Ready</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-6">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
