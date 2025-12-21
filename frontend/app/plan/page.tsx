"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SummaryTab } from "@/components/plan/summary-tab"
import { TimelineTab } from "@/components/plan/timeline-tab"
import { ChecklistTab } from "@/components/plan/checklist-tab"
import { DocumentsTab } from "@/components/plan/documents-tab"
import { RisksTab } from "@/components/plan/risks-tab"
import { PlanSkeleton } from "@/components/plan/plan-skeleton"
import { ChatFAB } from "@/components/chat-fab"
import { SharePlanDialog } from "@/components/share-plan-dialog"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { Download, Edit, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n"

export default function PlanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, messages } = useI18n()
  const [profile, setProfile] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("summary")
  const [isLoading, setIsLoading] = useState(true)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  useEffect(() => {
    const loadProfile = () => {
      const storedProfile = localStorage.getItem("visaverse_profile")
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile))
      } else {
        router.push("/onboarding")
      }
      setIsLoading(false)
    }

    // Simulate brief loading time for skeleton display
    setTimeout(loadProfile, 800)
  }, [router])

  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Your plan is being prepared for download...",
    })

    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your mobility plan has been downloaded.",
      })
    }, 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <PlanSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const tabs = [
    { value: "summary", label: messages.plan.tabs.summary },
    { value: "timeline", label: messages.plan.tabs.timeline },
    { value: "checklist", label: messages.plan.tabs.checklist },
    { value: "documents", label: messages.plan.tabs.documents },
    { value: "risks", label: messages.plan.tabs.risks },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{messages.plan.breadcrumb.home}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/onboarding">{messages.plan.breadcrumb.onboarding}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{messages.plan.breadcrumb.current}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-semibold text-foreground">{messages.plan.title}</h1>
              <p className="text-muted-foreground mt-2">{messages.plan.subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/onboarding">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent hover:scale-105 transition-transform"
                >
                  <Edit className="w-4 h-4" />
                  {t("common.editDetails")}
                </Button>
              </Link>
              <Button
                onClick={() => setShareDialogOpen(true)}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent hover:scale-105 transition-transform"
              >
                <Share2 className="w-4 h-4" />
                {t("common.share")}
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                data-action="export"
                className="gap-2 bg-transparent hover:scale-105 transition-transform"
              >
                <Download className="w-4 h-4" />
                {t("common.exportPdf")}
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="relative">
              <TabsList className="w-full justify-start bg-card border border-border p-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    data-value={tab.value}
                    className="flex-1 md:flex-none whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="summary" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <SummaryTab profile={profile} />
            </TabsContent>

            <TabsContent value="timeline" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <TimelineTab />
            </TabsContent>

            <TabsContent value="checklist" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <ChecklistTab />
            </TabsContent>

            <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <DocumentsTab />
            </TabsContent>

            <TabsContent value="risks" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <RisksTab />
            </TabsContent>
          </Tabs>

          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = tabs.findIndex((t) => t.value === activeTab)
                if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].value)
              }}
              disabled={activeTab === tabs[0].value}
              className="bg-transparent hover:scale-105 transition-transform"
            >
              {messages.plan.nav.previous}
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              {tabs.findIndex((t) => t.value === activeTab) + 1} of {tabs.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = tabs.findIndex((t) => t.value === activeTab)
                if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].value)
              }}
              disabled={activeTab === tabs[tabs.length - 1].value}
              className="bg-transparent hover:scale-105 transition-transform"
            >
              {messages.plan.nav.next}
            </Button>
          </div>
        </div>
      </div>

      <ChatFAB />
      <SharePlanDialog open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
      <PWAInstallPrompt />
    </div>
  )
}
