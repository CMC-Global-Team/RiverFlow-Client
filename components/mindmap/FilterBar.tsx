"use client"

import { Filter } from "lucide-react"

interface FilterBarProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
  showFavoritesOnly: boolean
  onFavoritesToggle: () => void
  sortBy: string
  onSortChange: (sort: string) => void
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "work", label: "Work" },
  { value: "personal", label: "Personal" },
  { value: "education", label: "Education" },
  { value: "project", label: "Project" },
  { value: "brainstorming", label: "Brainstorming" },
]

const statuses = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
]

const sortOptions = [
  { value: "updatedAt", label: "Last Modified" },
  { value: "createdAt", label: "Date Created" },
  { value: "title", label: "Title" },
  { value: "nodeCount", label: "Node Count" },
]

export default function FilterBar({
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  showFavoritesOnly,
  onFavoritesToggle,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filters:</span>
      </div>

      {/* Category Filter */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      {/* Favorites Toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={showFavoritesOnly}
          onChange={onFavoritesToggle}
          className="rounded border-border text-primary focus:ring-primary"
        />
        <span className="text-sm text-foreground">Favorites Only</span>
      </label>

      {/* Sort By */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

