"use client"

import { useCallback, useMemo } from "react"
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"
import {
  RectangleNode,
  CircleNode,
  DiamondNode,
  HexagonNode,
  EllipseNode,
  RoundedRectangleNode,
} from "./node-shapes"
import {
  CustomBezierEdge,
  CustomSmoothStepEdge,
  CustomStraightEdge,
  CustomStepEdge,
} from "./custom-edges"

interface DemoCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: any) => void
  onEdgesChange: (changes: any) => void
  onConnect: (connection: Connection) => void
  onNodeClick: (event: React.MouseEvent, node: Node) => void
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void
  onPaneClick: () => void
}

export default function DemoCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
}: DemoCanvasProps) {
  const nodeTypes = useMemo(
    () => ({
      rectangle: RectangleNode,
      circle: CircleNode,
      diamond: DiamondNode,
      hexagon: HexagonNode,
      ellipse: EllipseNode,
      roundedRectangle: RoundedRectangleNode,
    }),
    []
  )

  const edgeTypes = useMemo(
    () => ({
      bezier: CustomBezierEdge,
      smoothstep: CustomSmoothStepEdge,
      straight: CustomStraightEdge,
      step: CustomStepEdge,
      default: CustomSmoothStepEdge,
    }),
    []
  )

  const defaultEdgeOptions = {
    animated: true,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        className="bg-muted/20"
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            return node.data.color || "#3b82f6"
          }}
          className="bg-background border"
        />
      </ReactFlow>
    </div>
  )
}

