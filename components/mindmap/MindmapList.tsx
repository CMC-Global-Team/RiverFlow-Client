"use client"

import { Star, Share2, Archive, Trash2, Calendar, Network } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { MindmapSummary } from "@/types/mindmap.types"

interface MindmapListProps {
  mindmaps: MindmapSummary[]
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
  onArchive: (id: string) => void
  actionLoading: string | null
}

export default function MindmapList({
  mindmaps,
  onDelete,
  onToggleFavorite,
  onArchive,
  actionLoading,
}: MindmapListProps) {
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-3">
      {mindmaps.map((mindmap) => (
        <div
          key={mindmap.id}
          className={`
            group flex items-center gap-4 p-4 rounded-lg border border-border bg-card
            hover:border-primary/50 hover:shadow-md transition-all
            ${actionLoading === mindmap.id ? "opacity-50 pointer-events-none" : ""}
          `}
        >
          {/* Icon/Thumbnail */}
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Network className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-foreground truncate">
                {mindmap.title}
              </h3>
              {mindmap.isFavorite && (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
              {mindmap.isPublic && (
                <Share2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate mb-2">
              {mindmap.description || "No description"}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(mindmap.updatedAt)}
              </span>
              <span>{mindmap.nodeCount} nodes</span>
              <span>{mindmap.edgeCount} edges</span>
              {mindmap.category && (
                <span className="px-2 py-0.5 rounded-md bg-muted">
                  {mindmap.category}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleFavorite(mindmap.id)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title={mindmap.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Star className={`h-4 w-4 ${mindmap.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
            </button>
            <button
              onClick={() => onArchive(mindmap.id)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Archive"
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(mindmap.id)}
              className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

