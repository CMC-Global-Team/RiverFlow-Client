"use client"
import { useState, useEffect, useRef } from "react"
import { useMindmapContext } from '@/contexts/mindmap/MindmapContext'
import { memo } from "react"
import { Handle, Position, NodeProps } from "reactflow"

interface NodeData {
  label: string
  description?: string
  color?: string
  shape?: string
  isEditing?: boolean
}

// Rectangle Node (default)
export const RectangleNode = memo(({ data, selected }: NodeProps<NodeData>) => {
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
            id="target-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="target"
            id="target-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />
        <Handle
            type="target"
            id="target-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="target"
            id="target-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />      <div className="space-y-1">
        <div className="font-semibold text-sm" style={{ color }}>
          {data.label}
        </div>
        {data.description && <div className="text-xs text-muted-foreground line-clamp-2">{data.description}</div>}
      </div>
        <Handle
            type="source"
            id="source-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="source"
            id="source-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />
        <Handle
            type="source"
            id="source-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="source"
            id="source-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />    </div>
  )
})

RectangleNode.displayName = "RectangleNode"

// Circle Node
export const CircleNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"

  return (
    <div
      className={`rounded-full border-2 bg-background shadow-md transition-all w-32 h-32 flex items-center justify-center ${
        selected ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
      style={{ borderColor: color }}
    >
        <Handle
            type="target"
            id="target-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="target"
            id="target-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />
        <Handle
            type="target"
            id="target-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="target"
            id="target-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />      <div className="text-center px-3">
        <div className="font-semibold text-sm" style={{ color }}>
          {data.label}
        </div>
        {data.description && <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{data.description}</div>}
      </div>
        <Handle
            type="source"
            id="source-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="source"
            id="source-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />
        <Handle
            type="source"
            id="source-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="source"
            id="source-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />    </div>
  )
})

CircleNode.displayName = "CircleNode"

// Diamond Node
export const DiamondNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"

  return (
    <div className="relative w-32 h-32">
        <Handle
            type="target"
            id="target-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%", top: "-21%"}}
        />
        <Handle
            type="target"
            id="target-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%", right: "-21%"}}
        />
        <Handle
            type="target"
            id="target-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%", bottom: "-21%"}}
        />
        <Handle
            type="target"
            id="target-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%", left: "-21%"}}
        />      <div
        className={`absolute inset-0 rotate-45 border-2 bg-background shadow-md transition-all ${
          selected ? "ring-2 ring-primary ring-offset-2" : ""
        }`}
        style={{ borderColor: color }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-3 max-w-[80px]">
          <div className="font-semibold text-xs" style={{ color }}>
            {data.label}
          </div>
          {data.description && <div className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{data.description}</div>}
        </div>
      </div>
        <Handle
            type="source"
            id="source-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%", top: "-21%" }}
        />
        <Handle
            type="source"
            id="source-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%", right: "-21%" }}
        />
        <Handle
            type="source"
            id="source-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%", bottom: "-21%" }}
        />
        <Handle
            type="source"
            id="source-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%", left: "-21%" }}
        />    </div>
  )
})

DiamondNode.displayName = "DiamondNode"

// Hexagon Node
export const HexagonNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"

  return (
    <div className="relative w-36 h-32">
        <Handle
            type="target"
            id="target-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%", top: "3%" }}
        />
        <Handle
            type="target"
            id="target-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%", right: "3%" }}
        />
        <Handle
            type="target"
            id="target-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%", bottom: "3%" }}
        />
        <Handle
            type="target"
            id="target-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%", left: "3%" }}
        />      <svg
        viewBox="0 0 100 87"
        className={`w-full h-full transition-all ${selected ? "drop-shadow-lg" : ""}`}
      >
        <polygon
          points="50,5 95,25 95,65 50,85 5,65 5,25"
          fill="hsl(var(--background))"
          stroke={color}
          strokeWidth="2"
          className={selected ? "stroke-[3]" : ""}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="font-semibold text-sm" style={{ color }}>
            {data.label}
          </div>
          {data.description && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{data.description}</div>}
        </div>
      </div>
        <Handle
            type="source"
            id="source-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%", top: "3%" }}
        />
        <Handle
            type="source"
            id="source-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%", right: "3%" }}
        />
        <Handle
            type="source"
            id="source-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%", bottom: "3%" }}
        />
        <Handle
            type="source"
            id="source-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%", left: "3%" }}
        />    </div>
  )
})

HexagonNode.displayName = "HexagonNode"

// Ellipse Node
export const EllipseNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"

  return (
    <div
      className={`rounded-full border-2 bg-background shadow-md transition-all w-40 h-24 flex items-center justify-center ${
        selected ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
      style={{ borderColor: color }}
    >
        <Handle
            type="target"
            id="target-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="target"
            id="target-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />
        <Handle
            type="target"
            id="target-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="target"
            id="target-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />      <div className="text-center px-4">
        <div className="font-semibold text-sm" style={{ color }}>
          {data.label}
        </div>
        {data.description && <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{data.description}</div>}
      </div>
        <Handle
            type="source"
            id="source-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="source"
            id="source-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />
        <Handle
            type="source"
            id="source-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="source"
            id="source-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />    </div>
  )
})

EllipseNode.displayName = "EllipseNode"

// Rounded Rectangle Node
export const RoundedRectangleNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"

  return (
    <div
      className={`px-6 py-4 rounded-3xl border-2 bg-background shadow-md transition-all min-w-[150px] ${
        selected ? "ring-2 ring-primary ring-offset-2" : ""
      }`}
      style={{ borderColor: color }}
    >
        <Handle
            type="target"
            id="target-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="target"
            id="target-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />
        <Handle
            type="target"
            id="target-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="target"
            id="target-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />      <div className="space-y-1">
        <div className="font-semibold text-sm" style={{ color }}>
          {data.label}
        </div>
        {data.description && <div className="text-xs text-muted-foreground line-clamp-2">{data.description}</div>}
      </div>
        <Handle
            type="source"
            id="source-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="source"
            id="source-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />
        <Handle
            type="source"
            id="source-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="source"
            id="source-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />    </div>
  )
})

RoundedRectangleNode.displayName = "RoundedRectangleNode"

