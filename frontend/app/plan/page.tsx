"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import { Download, Edit, Share2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n"
import type { ProfileData, PlanResponse } from "@/lib/api"
import { useAppStore } from "@/lib/store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { buildChecklistItemsWithIds } from "@/lib/checklist-utils"

export default function PlanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, messages, locale } = useI18n()
  const profile = useAppStore((state) => state.profile)
  const plan = useAppStore((state) => state.plan)
  const isHydrated = useAppStore((state) => state.isHydrated)
  const isFetchingPlan = useAppStore((state) => state.isFetchingPlan)
  const planError = useAppStore((state) => state.planError)
  const hydrateFromStorage = useAppStore((state) => state.hydrateFromStorage)
  const syncPlan = useAppStore((state) => state.syncPlan)
  const completedChecklistIds = useAppStore((state) => state.completedChecklistIds)
  const [activeTab, setActiveTab] = useState("summary")
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  useEffect(() => {
    if (!isHydrated) return
    void syncPlan()
  }, [isHydrated, syncPlan])

  const isClient = typeof window !== "undefined"
  const resolvedProfile = profile as ProfileData | null
  const resolvedPlan = plan as PlanResponse | null
  const shouldShowSkeleton = !isClient || !isHydrated || isFetchingPlan
  const completedChecklistSet = useMemo(() => new Set(completedChecklistIds), [completedChecklistIds])

  const tabs = [
    { value: "summary", label: messages.plan.tabs.summary },
    { value: "timeline", label: messages.plan.tabs.timeline },
    { value: "checklist", label: messages.plan.tabs.checklist },
    { value: "documents", label: messages.plan.tabs.documents },
    { value: "risks", label: messages.plan.tabs.risks },
  ]

  const handleExportPDF = useCallback(() => {
    if (!resolvedPlan) {
      toast({
        title: messages.plan.errors.bannerTitle,
        description: messages.plan.errors.bannerDescription,
        variant: "destructive",
      })
      return
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer")
    if (!printWindow) {
      toast({
        title: messages.plan.export.windowBlockedTitle,
        description: messages.plan.export.windowBlockedDescription,
        variant: "destructive",
      })
      return
    }

    const formatList = (items?: string[]) =>
      items && items.length ? `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>` : "<p>—</p>"

    const summary = resolvedPlan.summary
    const timelineHtml =
      resolvedPlan.timeline.length > 0
        ? `<ol>${resolvedPlan.timeline
            .map(
              (item) =>
                `<li><strong>${item.title || item.date}</strong> · ${item.date} · ${item.status.toUpperCase()}<br/><span>${item.description}</span></li>`,
            )
            .join("")}</ol>`
        : `<p>${messages.plan.export.noTimeline}</p>`

    const checklistWithIds = buildChecklistItemsWithIds(
      resolvedPlan.checklist,
      messages.plan.fallbacks.checklistSection,
    )
    const checklistHtml =
      checklistWithIds.length > 0
        ? checklistWithIds
            .map(
              (category) =>
                `<div><h4>${category.category}</h4><ul>${category.items
                  .map((item) => {
                    const isCompleted = completedChecklistSet.has(item.id)
                    return `<li>${item.title} — ${item.priority.toUpperCase()} (${isCompleted ? messages.plan.export.statusCompleted : messages.plan.export.statusPending})</li>`
                  })
                  .join("")}</ul></div>`,
            )
            .join("")
        : `<p>${messages.plan.export.noChecklist}</p>`

    const documentsHtml =
      resolvedPlan.documents.length > 0
        ? resolvedPlan.documents
            .map(
              (category) =>
                `<div><h4>${category.category}</h4><ul>${category.documents
                  .map(
                    (doc) =>
                      `<li><strong>${doc.name}</strong><br/>${doc.description}${doc.requirements.length ? formatList(doc.requirements) : ""}</li>`,
                  )
                  .join("")}</ul></div>`,
            )
            .join("")
        : `<p>${messages.plan.export.noDocuments}</p>`

    const risksHtml =
      resolvedPlan.risks.length > 0
        ? `<ul>${resolvedPlan.risks
            .map(
              (risk) =>
                `<li><strong>${risk.title}</strong> (${risk.severity.toUpperCase()})<br/>${risk.description}<br/>Mitigation: ${
                  risk.mitigation.length ? risk.mitigation.join(", ") : "—"
                }</li>`,
            )
            .join("")}</ul>`
        : `<p>${messages.plan.export.noRisks}</p>`

    const profileHtml = resolvedProfile
      ? `<section><h2>${messages.plan.export.profileTitle}</h2><ul>
          <li>${messages.plan.export.fields.origin}: ${resolvedProfile.originCountry}</li>
          <li>${messages.plan.export.fields.destination}: ${resolvedProfile.destinationCountry}</li>
          <li>${messages.plan.export.fields.purpose}: ${resolvedProfile.purpose}</li>
          <li>${messages.plan.export.fields.departure}: ${resolvedProfile.departureDate}</li>
          <li>${messages.plan.export.fields.duration}: ${resolvedProfile.duration} ${messages.plan.export.fields.months}</li>
        </ul></section>`
      : ""

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>VisaVerse Plan</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
            h1, h2, h3, h4 { margin-bottom: 8px; }
            section { margin-bottom: 24px; }
            ul, ol { padding-left: 20px; }
            li { margin-bottom: 4px; }
            .meta { font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <header>
            <h1>${messages.plan.title}</h1>
            <p class="meta">${messages.plan.export.generatedAt} ${new Date().toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}</p>
          </header>
          ${profileHtml}
          <section>
            <h2>${messages.plan.export.summaryTitle}</h2>
            <p>${messages.plan.export.summaryFields.confidence}: ${(summary.confidence * 100).toFixed(0)}%</p>
            <p>${messages.plan.export.summaryFields.estimatedWeeks}: ${summary.estimatedWeeks}</p>
            <p>${messages.plan.export.summaryFields.totalDocuments}: ${summary.totalDocuments}</p>
            <p>${messages.plan.export.summaryFields.totalTasks}: ${summary.totalTasks}</p>
          </section>
          <section>
            <h2>${messages.plan.export.timelineTitle}</h2>
            ${timelineHtml}
          </section>
          <section>
            <h2>${messages.plan.export.checklistTitle}</h2>
            ${checklistHtml}
          </section>
          <section>
            <h2>${messages.plan.export.documentsTitle}</h2>
            ${documentsHtml}
          </section>
          <section>
            <h2>${messages.plan.export.risksTitle}</h2>
            ${risksHtml}
          </section>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()

    toast({
      title: messages.plan.export.readyTitle,
      description: messages.plan.export.readyDescription,
    })
  }, [resolvedPlan, resolvedProfile, messages, toast, completedChecklistSet])

  if (shouldShowSkeleton) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-6">
          <div className="max-w-6xl mx-auto space-y-4">
            <p className="text-sm text-muted-foreground">{messages.plan.loadingMessage}</p>
            <PlanSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!resolvedProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-6">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">{messages.plan.emptyState.title}</h2>
            <p className="text-muted-foreground">{messages.plan.emptyState.description}</p>
            <Button
              onClick={() => router.push("/onboarding")}
              className="gap-2"
              variant="default"
            >
              {messages.plan.emptyState.action}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!resolvedPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 px-6">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Plan unavailable</h2>
            <p className="text-muted-foreground">{planError ?? messages.plan.errors.loadFailed}</p>
            <Button onClick={() => syncPlan()} disabled={isFetchingPlan} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              {isFetchingPlan ? "Refreshing" : "Retry"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
              <Button
                onClick={() => syncPlan()}
                variant="outline"
                size="sm"
                disabled={isFetchingPlan}
                className="gap-2 bg-transparent hover:scale-105 transition-transform"
              >
                <RefreshCw className={`w-4 h-4 ${isFetchingPlan ? "animate-spin" : ""}`} />
                {isFetchingPlan ? "Refreshing" : "Refresh"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {planError && (
              <Alert variant="destructive" role="alert">
                <AlertTitle>{messages.plan.errors.bannerTitle}</AlertTitle>
                <AlertDescription className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <span>{planError || messages.plan.errors.bannerDescription}</span>
                  <Button
                    onClick={() => syncPlan()}
                    variant="secondary"
                    size="sm"
                    disabled={isFetchingPlan}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isFetchingPlan ? "animate-spin" : ""}`} />
                    {isFetchingPlan ? messages.plan.loadingMessage : messages.plan.errors.retryCta}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 mt-6">
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
              <SummaryTab profile={resolvedProfile} plan={resolvedPlan} />
            </TabsContent>

            <TabsContent value="timeline" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <TimelineTab timeline={resolvedPlan.timeline} profile={resolvedProfile} />
            </TabsContent>

            <TabsContent value="checklist" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <ChecklistTab key={JSON.stringify(resolvedPlan.checklist)} checklist={resolvedPlan.checklist} />
            </TabsContent>

            <TabsContent value="documents" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <DocumentsTab documents={resolvedPlan.documents} />
            </TabsContent>

            <TabsContent value="risks" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <RisksTab risks={resolvedPlan.risks} />
            </TabsContent>
          </Tabs>

          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = tabs.findIndex((tab) => tab.value === activeTab)
                if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].value)
              }}
              disabled={activeTab === tabs[0].value}
              className="bg-transparent hover:scale-105 transition-transform"
            >
              {messages.plan.nav.previous}
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              {tabs.findIndex((tab) => tab.value === activeTab) + 1} of {tabs.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const currentIndex = tabs.findIndex((tab) => tab.value === activeTab)
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
