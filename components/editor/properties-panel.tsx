"use client"

import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import NodePropertiesPanel from "./node-properties-panel"
import EdgePropertiesPanel from "./edge-properties-panel"

export default function PropertiesPanel() {
  const { selectedNode, selectedEdge } = useMindmapContext()

  // If edge is selected, show edge properties
  if (selectedEdge) {
    return <EdgePropertiesPanel />
  }

  // If node is selected, show node properties
  if (selectedNode) {
    return <NodePropertiesPanel />
  }

  // Default empty state
  return (
    <div className="w-64 border-l border-border bg-card overflow-y-auto">
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Properties</h3>
        <p className="text-sm text-muted-foreground">
          Select a node or connection to view and edit its properties.
        </p>
      </div>
    </div>
  )
}
