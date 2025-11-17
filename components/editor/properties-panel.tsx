"use client"

import { useState, useEffect } from "react"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import NodePropertiesPanel from "./node-properties-panel"
import EdgePropertiesPanel from "./edge-properties-panel"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PropertiesPanel() {
  const { selectedNode, selectedEdge } = useMindmapContext()
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 350 : 0, 
    y: 100 
  })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const hasSelection = selectedNode || selectedEdge

  // Auto open panel when something is selected
  useEffect(() => {
    if (hasSelection) {
      setIsOpen(true)
    }
  }, [hasSelection, selectedNode, selectedEdge])

  // If nothing selected and panel is closed, don't render
  if (!hasSelection && !isOpen) {
    return null
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.stopPropagation()
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div 
      className="fixed rounded-lg border border-border bg-card shadow-2xl backdrop-blur-sm bg-card/95 w-80 max-h-96 overflow-y-auto z-50 pointer-events-auto"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header - Draggable */}
      <div
        className="sticky top-0 flex items-center justify-between p-3 border-b border-border bg-card/50 backdrop-blur-sm cursor-grab active:cursor-grabbing hover:bg-card/70 transition-colors flex-shrink-0"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-sm font-semibold text-foreground">
          {selectedEdge ? "Connection" : selectedNode ? "Node" : "Properties"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {isOpen && hasSelection && (
        <div className="p-4">
          {selectedEdge && <EdgePropertiesPanel />}
          {selectedNode && !selectedEdge && <NodePropertiesPanel />}
        </div>
      )}

      {/* Empty State */}
      {!hasSelection && isOpen && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          Select a node or connection to view properties
        </div>
      )}
    </div>
  )
}
