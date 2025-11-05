"use client"

import { Grid3x3, List } from "lucide-react"

interface ViewToggleProps {
  view: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      <button
        onClick={() => onViewChange("grid")}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md transition-all
          ${view === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}
        `}
      >
        <Grid3x3 className="h-4 w-4" />
        <span className="text-sm font-medium">Grid</span>
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-md transition-all
          ${view === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}
        `}
      >
        <List className="h-4 w-4" />
        <span className="text-sm font-medium">List</span>
      </button>
    </div>
  )
}

