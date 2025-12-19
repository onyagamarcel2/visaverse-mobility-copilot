"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, DollarSign, Briefcase, Home, GripVertical } from "lucide-react"

export function ChecklistTab() {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set())
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const [checklistCategories, setChecklistCategories] = useState([
    {
      category: "Identity Documents",
      icon: FileText,
      color: "text-primary",
      items: [
        { id: "passport", title: "Valid passport (6+ months validity)", priority: "high" },
        { id: "photos", title: "Passport-sized photos (2-4 recent)", priority: "high" },
        { id: "birth-cert", title: "Birth certificate (certified copy)", priority: "medium" },
        { id: "prev-visa", title: "Previous visa copies (if applicable)", priority: "low" },
      ],
    },
    {
      category: "Financial Documents",
      icon: DollarSign,
      color: "text-success",
      items: [
        { id: "bank-stmt", title: "Bank statements (last 6 months)", priority: "high" },
        { id: "proof-funds", title: "Proof of funds or sponsorship letter", priority: "high" },
        { id: "tax-returns", title: "Tax returns (last 2 years)", priority: "medium" },
        { id: "property", title: "Property ownership documents", priority: "low" },
      ],
    },
    {
      category: "Employment/Study",
      icon: Briefcase,
      color: "text-accent",
      items: [
        { id: "emp-letter", title: "Employment letter or offer letter", priority: "high" },
        { id: "pay-slips", title: "Pay slips (last 3 months)", priority: "medium" },
        { id: "edu-cert", title: "Education certificates", priority: "medium" },
        { id: "resume", title: "Resume/CV", priority: "low" },
      ],
    },
    {
      category: "Accommodation & Travel",
      icon: Home,
      color: "text-warning",
      items: [
        { id: "hotel", title: "Hotel booking or accommodation proof", priority: "high" },
        { id: "flight", title: "Flight itinerary (reservation)", priority: "high" },
        { id: "insurance", title: "Travel insurance", priority: "medium" },
        { id: "invitation", title: "Invitation letter (if applicable)", priority: "medium" },
      ],
    },
  ])

  const toggleItem = (id: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
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

    const newCategories = [...checklistCategories]
    const sourceCategory = newCategories[sourceCategoryIndex]
    const targetCategory = newCategories[targetCategoryIndex]

    const [movedItem] = sourceCategory.items.splice(sourceItemIndex, 1)
    targetCategory.items.splice(targetItemIndex, 0, movedItem)

    setChecklistCategories(newCategories)
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

  const totalItems = checklistCategories.reduce((sum, cat) => sum + cat.items.length, 0)
  const completedCount = completedItems.size

  return (
    <div className="space-y-6">
      <Card className="p-6 border-border bg-primary/5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">Overall Progress</h3>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {totalItems} completed
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / totalItems) * 100}%` }}
          />
        </div>
      </Card>

      {checklistCategories.map((category, categoryIndex) => (
        <Card key={categoryIndex} className="p-6 border-border">
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
                    className={`text-foreground transition-all ${completedItems.has(item.id) ? "line-through opacity-50" : ""}`}
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
