"use client"

import { memo } from "react"
import {
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  BaseEdge,
  EdgeLabelRenderer,
} from "reactflow"

// Custom Bezier Edge
export const CustomBezierEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: (labelStyle as any)?.fontSize || 12,
              fontWeight: (labelStyle as any)?.fontWeight || 500,
              color: (labelStyle as any)?.fill || "#000",
              backgroundColor: (labelBgStyle as any)?.fill || "#fff",
              opacity: (labelBgStyle as any)?.fillOpacity || 0.9,
              padding: "4px 8px",
              borderRadius: 4,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

CustomBezierEdge.displayName = "CustomBezierEdge"

// Custom Smooth Step Edge
export const CustomSmoothStepEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: (labelStyle as any)?.fontSize || 12,
              fontWeight: (labelStyle as any)?.fontWeight || 500,
              color: (labelStyle as any)?.fill || "#000",
              backgroundColor: (labelBgStyle as any)?.fill || "#fff",
              opacity: (labelBgStyle as any)?.fillOpacity || 0.9,
              padding: "4px 8px",
              borderRadius: 4,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

CustomSmoothStepEdge.displayName = "CustomSmoothStepEdge"

// Custom Straight Edge
export const CustomStraightEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: (labelStyle as any)?.fontSize || 12,
              fontWeight: (labelStyle as any)?.fontWeight || 500,
              color: (labelStyle as any)?.fill || "#000",
              backgroundColor: (labelBgStyle as any)?.fill || "#fff",
              opacity: (labelBgStyle as any)?.fillOpacity || 0.9,
              padding: "4px 8px",
              borderRadius: 4,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

CustomStraightEdge.displayName = "CustomStraightEdge"

// Custom Step Edge (using smoothstep path for consistency)
export const CustomStepEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0, // Make it step-like
  })

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: (labelStyle as any)?.fontSize || 12,
              fontWeight: (labelStyle as any)?.fontWeight || 500,
              color: (labelStyle as any)?.fill || "#000",
              backgroundColor: (labelBgStyle as any)?.fill || "#fff",
              opacity: (labelBgStyle as any)?.fillOpacity || 0.9,
              padding: "4px 8px",
              borderRadius: 4,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
})

CustomStepEdge.displayName = "CustomStepEdge"

