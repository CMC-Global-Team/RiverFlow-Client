"use client"

import { useState } from "react"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import NodePropertiesPanel from "./node-properties-panel"
import EdgePropertiesPanel from "./edge-properties-panel"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function PropertiesPanel() {
  const { selectedNode, selectedEdge } = useMindmapContext()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Hide sidebar if nothing is selected
  const hasSelection = selectedNode || selectedEdge

  if (!hasSelection) {
    return null // Completely hide when nothing selected
  }

  return (
    <div 
      className={`relative border-l border-border bg-card overflow-y-auto transition-all duration-300 ${
        isCollapsed ? 'w-0' : 'w-80'
      }`}
    >
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-8 top-4 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all"
        title={isCollapsed ? "Expand properties" : "Collapse properties"}
      >
        {isCollapsed ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>

      {/* Content */}
      {!isCollapsed && (
        <>
          {selectedEdge && <EdgePropertiesPanel />}
          {selectedNode && !selectedEdge && <NodePropertiesPanel />}
        </>
      )}
    </div>
  )
}
