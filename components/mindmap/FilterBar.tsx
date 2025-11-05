"use client"

import { Filter, ChevronDown, Star } from "lucide-react"
import { useState } from "react"

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

function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  options: { value: string; label: string }[]; 
  placeholder?: string 
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-all text-sm min-w-[140px] justify-between"
      >
        <span className="text-foreground">{selectedOption?.label || placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-2.5 text-left text-sm transition-colors
                  ${value === option.value 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-foreground hover:bg-muted'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

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
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border border-border shadow-sm">
      <div className="flex items-center gap-2">
        <Filter className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium text-foreground">Filters:</span>
      </div>

      {/* Category Filter */}
      <CustomSelect
        value={selectedCategory}
        onChange={onCategoryChange}
        options={categories}
        placeholder="Category"
      />

      {/* Status Filter */}
      <CustomSelect
        value={selectedStatus}
        onChange={onStatusChange}
        options={statuses}
        placeholder="Status"
      />

      {/* Favorites Toggle */}
      <button
        onClick={onFavoritesToggle}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
          ${showFavoritesOnly 
            ? 'border-yellow-500 bg-yellow-500/10 text-yellow-600' 
            : 'border-border bg-background hover:bg-muted'
          }
        `}
      >
        <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-yellow-500' : ''}`} />
        <span className="text-sm font-medium">Favorites</span>
      </button>

      {/* Sort By */}
      <div className="ml-auto flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort:</span>
        <CustomSelect
          value={sortBy}
          onChange={onSortChange}
          options={sortOptions}
          placeholder="Sort by"
        />
      </div>
    </div>
  )
}


