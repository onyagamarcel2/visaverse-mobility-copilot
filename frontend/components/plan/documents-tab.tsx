"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { FileText, Info, HelpCircle, Upload, X, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { PlanResponse } from "@/lib/api"
import { PlanNoData } from "@/components/plan/no-data"
import { useI18n } from "@/lib/i18n"

interface DocumentsTabProps {
  documents: PlanResponse["documents"]
}

export function DocumentsTab({ documents }: DocumentsTabProps) {
  const { toast } = useToast()
  const { messages } = useI18n()
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({})
  const [dragOver, setDragOver] = useState<string | null>(null)
  const documentCategories = useMemo(() => documents, [documents])

  const handleDragEnter = (e: React.DragEvent, docName: string) => {
    e.preventDefault()
    setDragOver(docName)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(null)
  }

  const handleDrop = (e: React.DragEvent, docName: string) => {
    e.preventDefault()
    setDragOver(null)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setUploadedFiles((prev) => ({
        ...prev,
        [docName]: [...(prev[docName] || []), ...files],
      }))
      toast({
        title: messages.plan.documents.uploadToastTitle,
        description: messages.plan.documents.uploadToastDescription
          .replace("{count}", String(files.length))
          .replace("{name}", docName),
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length > 0) {
      setUploadedFiles((prev) => ({
        ...prev,
        [docName]: [...(prev[docName] || []), ...files],
      }))
      toast({
        title: messages.plan.documents.uploadToastTitle,
        description: messages.plan.documents.uploadToastDescription
          .replace("{count}", String(files.length))
          .replace("{name}", docName),
      })
    }
  }

  const removeFile = (docName: string, fileIndex: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [docName]: prev[docName].filter((_, index) => index !== fileIndex),
    }))
    toast({
      title: messages.plan.documents.removeToastTitle,
      description: messages.plan.documents.removeToastDescription,
    })
  }

  if (documentCategories.length === 0) {
    return (
      <PlanNoData
        title={messages.plan.noData.documentsTitle}
        description={messages.plan.noData.documentsDescription}
      />
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="p-6 border-border bg-accent/5">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">{messages.plan.documents.tipsTitle}</h3>
              <p className="text-sm text-muted-foreground">{messages.plan.documents.tipsDescription}</p>
            </div>
          </div>
        </Card>

        <Accordion type="single" collapsible className="space-y-4">
          {documentCategories.map((category, categoryIndex) => {
            const categoryTitle =
              category.category ?? `${messages.plan.fallbacks.checklistSection} ${categoryIndex + 1}`
            return (
            <AccordionItem
              key={categoryTitle}
              value={`category-${categoryIndex}`}
              className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{categoryTitle}</span>
                  <span className="text-sm text-muted-foreground">
                    ({category.documents.length} {messages.plan.documents.itemsLabel})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4 mt-2">
                  {category.documents.map((doc) => (
                    <div
                      key={`${categoryTitle}-${doc.name}`}
                      className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{doc.name}</h4>
                        {doc.description && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{doc.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {uploadedFiles[doc.name]?.length > 0 && (
                          <Badge className="bg-success text-white ml-auto gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {messages.plan.documents.uploadedLabel}
                          </Badge>
                        )}
                      </div>
                      {doc.description && <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>}
                      <ul className="space-y-1 mb-4">
                        {doc.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="text-sm text-foreground flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>

                      <div
                        onDragEnter={(e) => handleDragEnter(e, doc.name)}
                        onDragOver={(e) => e.preventDefault()}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, doc.name)}
                        className={`border-2 border-dashed rounded-lg p-4 transition-all ${
                          dragOver === doc.name ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2 text-center">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">{messages.plan.documents.dropTitle}</p>
                            <p className="text-xs text-muted-foreground">{messages.plan.documents.dropOr}</p>
                          </div>
                          <label>
                            <input
                              type="file"
                              multiple
                              onChange={(e) => handleFileSelect(e, doc.name)}
                              className="hidden"
                            />
                            <Button type="button" size="sm" variant="outline" className="cursor-pointer bg-transparent">
                              {messages.plan.documents.browse}
                            </Button>
                          </label>
                        </div>

                        {uploadedFiles[doc.name]?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                              {messages.plan.documents.uploadedFiles}
                            </p>
                            <div className="space-y-1">
                              {uploadedFiles[doc.name].map((file, fileIndex) => (
                                <div key={fileIndex} className="flex items-center justify-between p-2 rounded bg-muted/50">
                                  <span className="text-xs text-foreground truncate flex-1">{file.name}</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeFile(doc.name, fileIndex)}
                                    className="h-6 w-6 p-0 ml-2"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )})}
        </Accordion>
      </div>
    </TooltipProvider>
  )
}
