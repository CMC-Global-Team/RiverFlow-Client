"use client"

import { useState } from "react"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import NodePropertiesPanel from "./node-properties-panel"
import EdgePropertiesPanel from "./edge-properties-panel"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PropertiesPanel() {
  const { selectedNode, selectedEdge } = useMindmapContext()
  const [isOpen, setIsOpen] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Hide panel if nothing is selected
  const hasSelection = selectedNode || selectedEdge

  if (!hasSelection) {
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
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div 
      className="fixed rounded-lg border border-border bg-card shadow-lg backdrop-blur-sm bg-card/95 w-80 max-h-96 overflow-y-auto"
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
        className="sticky top-0 flex items-center justify-between p-3 border-b border-border bg-card/50 backdrop-blur-sm cursor-grab active:cursor-grabbing hover:bg-card/70 transition-colors"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-sm font-semibold">
          {selectedEdge ? "Connection" : "Properties"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        {selectedEdge && <EdgePropertiesPanel />}
        {selectedNode && !selectedEdge && <NodePropertiesPanel />}
      </div>
    </div>
  )
}
