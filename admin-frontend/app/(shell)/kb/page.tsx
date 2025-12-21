import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const statuses: Array<{ label: string; count: number; variant?: "secondary" | "default" | "outline" }> = [
  { label: "Draft", count: 4 },
  { label: "In Review", count: 2, variant: "secondary" },
  { label: "Published", count: 18, variant: "outline" },
]

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Knowledge Base</p>
          <h1 className="text-2xl font-semibold">Articles & Workflows</h1>
        </div>
        <Button asChild>
          <Link href="/kb/new">New document</Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {statuses.map((status) => (
          <Card key={status.label} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{status.label}</CardTitle>
              <Badge variant={status.variant ?? "default"}>{status.count}</Badge>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-muted-foreground">
                Track {status.label.toLowerCase()} content across organizations with review-ready metadata.
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
