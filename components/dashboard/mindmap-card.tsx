"use client"

import { MoreVertical, Share2, Trash2, Edit, Star, Archive, Copy } from "lucide-react"
import { useState } from "react"
import { MindmapSummary } from "@/types/mindmap.types"
import { formatDistanceToNow } from "date-fns"

interface MindmapCardProps {
  mindmap: MindmapSummary
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  onArchive?: (id: string) => void
  onEdit?: (id: string) => void
  onDuplicate?: (id: string) => void
  onClick?: (id: string) => void
}

export default function MindmapCard({ 
  mindmap, 
  onDelete, 
  onToggleFavorite, 
  onArchive, 
  onEdit,
  onDuplicate,
  onClick 
}: MindmapCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return dateString
    }
  }

  return (
    <div 
      className="group rounded-xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onClick?.(mindmap.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {mindmap.title}
            </h3>
            {mindmap.isFavorite && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
            {mindmap.isPublic && (
              <Share2 className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {mindmap.description || 'No description'}
          </p>
          {mindmap.tags && mindmap.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {mindmap.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            className="rounded-lg p-2 hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(false)
                }}
              />
              <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-card shadow-lg z-20">
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors rounded-t-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onEdit?.(mindmap.id)
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit Name & Description
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onDuplicate?.(mindmap.id) 
                  }}
                >
                  <Copy className="h-4 w-4" /> 
                  Duplicate
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onToggleFavorite?.(mindmap.id)
                  }}
                >
                  <Star className="h-4 w-4" />
                  {mindmap.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onArchive?.(mindmap.id)
                  }}
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors rounded-b-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onDelete?.(mindmap.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <p>Modified {formatDate(mindmap.updatedAt)}</p>
          <p className="mt-1">
            {mindmap.nodeCount} nodes • {mindmap.edgeCount} edges
          </p>
        </div>
        {mindmap.category && (
          <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
            {mindmap.category}
          </span>
        )}
      </div>
    </div>
  )
}
