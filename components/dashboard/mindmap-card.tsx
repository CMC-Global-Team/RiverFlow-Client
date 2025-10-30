"use client"

import { MoreVertical, Share2, Trash2, Edit } from "lucide-react"
import { useState } from "react"

interface MindmapCardProps {
  id: string
  title: string
  description: string
  lastModified: string
  collaborators: number
}

export default function MindmapCard({ id, title, description, lastModified, collaborators }: MindmapCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-2 hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card shadow-lg z-10">
              <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors rounded-t-lg">
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors rounded-b-lg">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p>Modified {lastModified}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(collaborators, 3) }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-accent border border-card flex items-center justify-center text-xs font-bold text-primary-foreground"
              >
                {i + 1}
              </div>
            ))}
          </div>
          {collaborators > 3 && <span className="text-xs text-muted-foreground">+{collaborators - 3}</span>}
        </div>
      </div>
    </div>
  )
}
