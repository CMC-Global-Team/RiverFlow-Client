"use client"

import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useMindmapContext } from '@/contexts/mindmap/MindmapContext'
import {
  RectangleNode,
  CircleNode,
  DiamondNode,
  HexagonNode,
  EllipseNode,
  RoundedRectangleNode,
} from './node-shapes'

export default function Canvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    setSelectedEdge,
  } = useMindmapContext()

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

  const defaultEdgeOptions = {
    animated: true,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }

  const onNodeClick = useCallback(
    (_event: any, node: any) => {
      setSelectedNode(node)
      setSelectedEdge(null)
    },
    [setSelectedNode, setSelectedEdge]
  )

  const onEdgeClick = useCallback(
    (_event: any, edge: any) => {
      setSelectedEdge(edge)
      setSelectedNode(null)
    },
    [setSelectedEdge, setSelectedNode]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [setSelectedNode, setSelectedEdge])

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
