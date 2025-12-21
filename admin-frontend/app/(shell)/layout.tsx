import Link from "next/link"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/kb", label: "Knowledge Base" },
  { href: "/rules", label: "Rules" },
  { href: "/prompts", label: "Prompts" },
  { href: "/models", label: "Models" },
  { href: "/runs", label: "Runs" },
  { href: "/feedback", label: "Feedback" },
  { href: "/users", label: "Users" },
  { href: "/organizations", label: "Organizations" },
  { href: "/audit", label: "Audit" },
  { href: "/settings", label: "Settings" },
]

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="hidden md:flex md:flex-col w-64 border-r bg-card/60">
        <div className="px-6 py-4 border-b">
          <p className="text-lg font-semibold">VisaVerse Admin</p>
          <p className="text-sm text-muted-foreground">Control Plane</p>
        </div>
        <ScrollArea className="flex-1">
          <nav className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Button key={item.href} asChild variant="ghost" className="w-full justify-start">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>
        <Separator />
        <div className="px-4 py-3 text-sm text-muted-foreground">Harmonized with user app UI</div>
      </aside>
      <main className="flex-1 min-h-screen bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}
