import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PlaceholderPage() {
  const path = typeof window === "undefined" ? "" : window.location.pathname
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Admin workspace</p>
          <h1 className="text-2xl font-semibold">Coming soon</h1>
        </div>
        <Button asChild variant="secondary">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This screen is reserved for the admin control plane. UX is scaffolded to match the user-facing palette while backend
            endpoints and data contracts land.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
