"use client"

import { useState, useEffect, useRef } from "react"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import NodePropertiesPanel from "./node-properties-panel"
import EdgePropertiesPanel from "./edge-properties-panel"
import { X, GripHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PropertiesPanel() {
  const { selectedNode, selectedEdge } = useMindmapContext()
  const [isOpen, setIsOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [position, setPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 450 : 0, 
    y: 100 
  })
  const [size, setSize] = useState({ width: 400, height: 500 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const panelRef = useRef<HTMLDivElement>(null)

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
    if ((e.target as HTMLElement).closest('.resize-handle')) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    })
    e.stopPropagation()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.stopPropagation()
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y
        setSize({
          width: Math.max(300, resizeStart.width + deltaX),
          height: Math.max(250, resizeStart.height + deltaY),
        })
      }
    }

    const handleGlobalMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [isResizing, resizeStart])

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div 
      ref={panelRef}
      className="fixed rounded-lg border border-border bg-card shadow-2xl backdrop-blur-sm bg-card/95 overflow-hidden z-50 pointer-events-auto"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${size.width}px`,
        height: `${size.height}px`,
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
      <div className="overflow-y-auto" style={{ height: `calc(100% - 45px)` }}>
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

      {/* Resize Handle - Bottom Right */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-primary/50 transition-colors"
        onMouseDown={handleResizeStart}
        title="Drag to resize"
      />
    </div>
  )
}
