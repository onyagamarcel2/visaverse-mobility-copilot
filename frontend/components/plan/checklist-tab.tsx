"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, DollarSign, Briefcase, Home, GripVertical, type LucideIcon } from "lucide-react"
import type { PlanResponse } from "@/lib/api"
import { PlanNoData } from "@/components/plan/no-data"
import { useI18n } from "@/lib/i18n"
import { useAppStore } from "@/lib/store"
import { buildChecklistItemsWithIds } from "@/lib/checklist-utils"

interface ChecklistTabProps {
  checklist: PlanResponse["checklist"]
}

const ICON_MAP: Array<{ keyword: RegExp; icon: LucideIcon; color: string }> = [
  { keyword: /identity|document|id|passport/i, icon: FileText, color: "text-primary" },
  { keyword: /finance|fund|bank/i, icon: DollarSign, color: "text-success" },
  { keyword: /employment|study|work|education/i, icon: Briefcase, color: "text-accent" },
  { keyword: /accommodation|travel|housing|stay/i, icon: Home, color: "text-warning" },
]

const defaultIcon = { icon: FileText, color: "text-primary" }

const buildCategories = (checklist: PlanResponse["checklist"], fallbackLabel: string) => {
  return buildChecklistItemsWithIds(checklist, fallbackLabel).map((category) => {
    const iconMatch = ICON_MAP.find((entry) => entry.keyword.test(category.category ?? "")) ?? defaultIcon
    return {
      category: category.category,
      icon: iconMatch.icon,
      color: iconMatch.color,
      items: category.items,
    }
  })
}

export function ChecklistTab({ checklist }: ChecklistTabProps) {
  const { messages } = useI18n()
  const completedChecklistIds = useAppStore((state) => state.completedChecklistIds)
  const toggleChecklistItem = useAppStore((state) => state.toggleChecklistItem)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [checklistCategories, setChecklistCategories] = useState(() =>
    buildCategories(checklist, messages.plan.fallbacks.checklistSection),
  )

  const allowedIds = useMemo(
    () => checklistCategories.flatMap((category) => category.items.map((item) => item.id)),
    [checklistCategories],
  )
  const allowedIdSet = useMemo(() => new Set(allowedIds), [allowedIds])
  const completedItems = useMemo(
    () => new Set(completedChecklistIds.filter((id) => allowedIdSet.has(id))),
    [completedChecklistIds, allowedIdSet],
  )
  const totalItems = useMemo(() => checklistCategories.reduce((sum, cat) => sum + cat.items.length, 0), [checklistCategories])

  const toggleItem = (id: string) => {
    toggleChecklistItem(id)
  }

  const handleDragStart = (e: React.DragEvent, categoryIndex: number, itemIndex: number) => {
    setDraggedItem(`${categoryIndex}-${itemIndex}`)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetCategoryIndex: number, targetItemIndex: number) => {
    e.preventDefault()
    if (!draggedItem) return

    const [sourceCategoryIndex, sourceItemIndex] = draggedItem.split("-").map(Number)

    if (sourceCategoryIndex === targetCategoryIndex && sourceItemIndex === targetItemIndex) {
      setDraggedItem(null)
      return
    }

    setChecklistCategories((prev) => {
      const newCategories = [...prev]
      const sourceCategory = newCategories[sourceCategoryIndex]
      const targetCategory = newCategories[targetCategoryIndex]
      const [movedItem] = sourceCategory.items.splice(sourceItemIndex, 1)
      targetCategory.items.splice(targetItemIndex, 0, movedItem)
      return newCategories
    })

    setDraggedItem(null)
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      high: "bg-destructive text-destructive-foreground",
      medium: "bg-warning text-foreground",
      low: "bg-muted text-muted-foreground",
    }
    return styles[priority as keyof typeof styles] || styles.low
  }

  const completedCount = completedItems.size
  const progressLabel = messages.plan.checklistProgress.count
    .replace("{completed}", String(completedCount))
    .replace("{total}", String(totalItems))

  if (checklist.length === 0) {
    return (
      <PlanNoData
        title={messages.plan.noData.checklistTitle}
        description={messages.plan.noData.checklistDescription}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border bg-primary/5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">{messages.plan.checklistProgress.title}</h3>
          <span className="text-sm text-muted-foreground">{progressLabel}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalItems ? (completedCount / totalItems) * 100 : 0}%` }}
          />
        </div>
      </Card>

      {checklistCategories.map((category, categoryIndex) => (
        <Card key={category.category} className="p-6 border-border">
          <div className="flex items-center gap-3 mb-4">
            <category.icon className={`w-5 h-5 ${category.color}`} />
            <h3 className="font-semibold text-foreground">{category.category}</h3>
          </div>

          <div className="space-y-3">
            {category.items.map((item, itemIndex) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, categoryIndex, itemIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, categoryIndex, itemIndex)}
                className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all cursor-move ${
                  draggedItem === `${categoryIndex}-${itemIndex}` ? "opacity-50" : ""
                }`}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <Checkbox
                  checked={completedItems.has(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p
                    className={`text-foreground transition-all ${
                      completedItems.has(item.id) ? "line-through opacity-50" : ""
                    }`}
                  >
                    {item.title}
                  </p>
                </div>
                <Badge className={getPriorityBadge(item.priority)} variant="secondary">
                  {item.priority}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}
