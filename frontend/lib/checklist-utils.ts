import type { PlanResponse } from "@/lib/api"

export type ChecklistItemWithId = {
  id: string
  title: string
  priority: "high" | "medium" | "low"
}

export type ChecklistCategoryWithIds = {
  category: string
  items: ChecklistItemWithId[]
}

const slugify = (value: string, fallback: string) => {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-") || fallback
}

export const buildChecklistItemsWithIds = (
  checklist: PlanResponse["checklist"],
  fallbackLabel = "Section",
): ChecklistCategoryWithIds[] => {
  return checklist.map((category, categoryIndex) => ({
    category: category.category ?? `${fallbackLabel} ${categoryIndex + 1}`,
    items: (category.items ?? []).map((item, itemIndex) => ({
      id: `${categoryIndex}-${itemIndex}-${slugify(item.title, `${categoryIndex}${itemIndex}`)}`,
      title: item.title,
      priority: item.priority,
    })),
  }))
}
