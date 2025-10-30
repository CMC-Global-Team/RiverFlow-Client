"use client"

import {
  Type,
  Circle,
  Square,
  Trash2,
  Copy,
  Undo2,
  Redo2,
  Download,
  Share2,
  Settings,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

export default function Toolbar() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-lg">
      {/* Text Tools */}
      <div className="flex items-center gap-1 border-r border-border pr-3">
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Add Text">
          <Type className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
      </div>

      {/* Shape Tools */}
      <div className="flex items-center gap-1 border-r border-border pr-3">
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Add Circle">
          <Circle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Add Rectangle">
          <Square className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
      </div>

      {/* Edit Tools */}
      <div className="flex items-center gap-1 border-r border-border pr-3">
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Undo">
          <Undo2 className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Redo">
          <Redo2 className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Copy">
          <Copy className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Delete">
          <Trash2 className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
      </div>

      {/* Zoom Tools */}
      <div className="flex items-center gap-1 border-r border-border pr-3">
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Zoom In">
          <ZoomIn className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Zoom Out">
          <ZoomOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
      </div>

      {/* Export & Share */}
      <div className="flex items-center gap-1 ml-auto">
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Download">
          <Download className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Share">
          <Share2 className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
        <button className="rounded-lg p-2 hover:bg-muted transition-colors" title="Settings">
          <Settings className="h-5 w-5 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </div>
  )
}
