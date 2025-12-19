"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { FileText, Info, HelpCircle, Upload, X, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DocumentsTab() {
  const { toast } = useToast()
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({})
  const [dragOver, setDragOver] = useState<string | null>(null)

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
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded for ${docName}`,
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
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded for ${docName}`,
      })
    }
  }

  const removeFile = (docName: string, fileIndex: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [docName]: prev[docName].filter((_, index) => index !== fileIndex),
    }))
    toast({
      title: "File removed",
      description: "File has been removed from the list",
    })
  }

  const documentCategories = [
    {
      category: "Identity & Personal Documents",
      documents: [
        {
          name: "Valid Passport",
          description: "Original passport with at least 6 months validity beyond your intended stay",
          tooltip:
            "Your passport must be valid for 6 months after your planned return date. This is a universal requirement for most countries.",
          requirements: ["Must have at least 2 blank pages", "Should be in good condition", "No damaged or torn pages"],
        },
        {
          name: "Passport Photos",
          description: "Recent color photographs meeting visa specifications",
          tooltip:
            "Biometric photos are required for most visa applications. Visit a professional photo studio for best results.",
          requirements: [
            "Size: 2x2 inches (51x51mm)",
            "White or light-colored background",
            "Taken within last 6 months",
            "2-4 copies required",
          ],
        },
        {
          name: "Birth Certificate",
          description: "Official birth certificate or equivalent",
          tooltip:
            "An apostille is a special certification that validates documents for international use under the Hague Convention.",
          requirements: ["Certified copy", "Translated to English/French if needed", "Apostilled if required"],
        },
      ],
    },
    {
      category: "Financial Documents",
      documents: [
        {
          name: "Bank Statements",
          description: "Proof of sufficient funds for your stay",
          requirements: [
            "Last 6 months of statements",
            "Shows regular income/transactions",
            "Account balance meets minimum requirement",
            "Stamped and signed by bank",
          ],
        },
        {
          name: "Sponsorship Letter",
          description: "If someone is financially supporting your trip",
          requirements: [
            "Notarized letter from sponsor",
            "Sponsor's bank statements",
            "Proof of relationship",
            "Sponsor's ID copies",
          ],
        },
      ],
    },
    {
      category: "Employment/Educational Documents",
      documents: [
        {
          name: "Employment Letter",
          description: "Letter from employer on company letterhead",
          requirements: [
            "Position and salary details",
            "Employment start date",
            "Leave approval for travel dates",
            "Company stamp and signature",
          ],
        },
        {
          name: "Educational Certificates",
          description: "Diplomas and transcripts if traveling for study",
          requirements: [
            "All degrees and certificates",
            "Official transcripts",
            "Language proficiency tests",
            "Translated if needed",
          ],
        },
      ],
    },
    {
      category: "Travel & Accommodation",
      documents: [
        {
          name: "Flight Reservation",
          description: "Round-trip flight booking or itinerary",
          requirements: [
            "Reservation confirmation",
            "Shows entry and exit dates",
            "Valid booking reference",
            "Not required to purchase before approval",
          ],
        },
        {
          name: "Accommodation Proof",
          description: "Where you'll be staying",
          requirements: [
            "Hotel reservations",
            "Lease agreement if renting",
            "Invitation letter if staying with someone",
            "Address and contact details",
          ],
        },
        {
          name: "Travel Insurance",
          description: "Medical coverage for your trip",
          requirements: [
            "Minimum coverage amount",
            "Valid for entire trip duration",
            "Covers medical emergencies",
            "Covers repatriation",
          ],
        },
      ],
    },
  ]

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Card className="p-6 border-border bg-accent/5">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Document Preparation Tips</h3>
              <p className="text-sm text-muted-foreground">
                All documents should be originals or certified copies. If not in English or French, provide certified
                translations. Keep both digital and physical copies organized.
              </p>
            </div>
          </div>
        </Card>

        <Accordion type="single" collapsible className="space-y-4">
          {documentCategories.map((category, categoryIndex) => (
            <AccordionItem
              key={categoryIndex}
              value={`category-${categoryIndex}`}
              className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{category.category}</span>
                  <span className="text-sm text-muted-foreground">({category.documents.length} items)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4 mt-2">
                  {category.documents.map((doc, docIndex) => (
                    <div
                      key={docIndex}
                      className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{doc.name}</h4>
                        {doc.tooltip && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{doc.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {uploadedFiles[doc.name]?.length > 0 && (
                          <Badge className="bg-success text-white ml-auto gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Uploaded
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
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
                          dragOver === doc.name
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2 text-center">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">Drag and drop files here</p>
                            <p className="text-xs text-muted-foreground">or</p>
                          </div>
                          <label>
                            <input
                              type="file"
                              multiple
                              onChange={(e) => handleFileSelect(e, doc.name)}
                              className="hidden"
                            />
                            <Button type="button" size="sm" variant="outline" className="cursor-pointer bg-transparent">
                              Browse Files
                            </Button>
                          </label>
                        </div>

                        {uploadedFiles[doc.name]?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Uploaded Files:</p>
                            <div className="space-y-1">
                              {uploadedFiles[doc.name].map((file, fileIndex) => (
                                <div
                                  key={fileIndex}
                                  className="flex items-center justify-between p-2 rounded bg-muted/50"
                                >
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
          ))}
        </Accordion>
      </div>
    </TooltipProvider>
  )
}
