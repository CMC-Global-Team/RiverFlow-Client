"use client"

import { memo } from "react"
import { Handle, Position, NodeProps } from "reactflow"

interface CustomNodeData {
  label: string
  description?: string
  color?: string
}

function CustomNode({ data, selected }: NodeProps<CustomNodeData>) {
  const color = data.color || "#3b82f6"

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-background shadow-md transition-all min-w-[150px] ${
        selected ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
      style={{ borderColor: color }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
        style={{ background: color }}
      />

      <div className="space-y-1">
        <div className="font-semibold text-sm" style={{ color }}>
          {data.label}
        </div>
        {data.description && (
          <div className="text-xs text-muted-foreground line-clamp-2">
            {data.description}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
        style={{ background: color }}
      />
    </div>
  )
}

export default memo(CustomNode)

