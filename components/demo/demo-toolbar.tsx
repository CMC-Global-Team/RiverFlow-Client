"use client"

import { Plus, Trash2, ZoomIn, ZoomOut, Maximize2, Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DemoToolbarProps {
  onAddNode: () => void
  onDeleteSelected: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onSave: () => void
  onLoad: () => void
}

export default function DemoToolbar({
  onAddNode,
  onDeleteSelected,
  onZoomIn,
  onZoomOut,
  onFitView,
  onSave,
  onLoad,
}: DemoToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onAddNode}
          title="Add Node"
          className="hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onDeleteSelected}
          title="Delete Selected"
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onFitView}
          title="Fit View"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onSave}
          title="Save Mindmap"
          className="hover:bg-primary/10 hover:text-primary"
        >
          <Download className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onLoad}
          title="Load Mindmap"
          className="hover:bg-primary/10 hover:text-primary"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

