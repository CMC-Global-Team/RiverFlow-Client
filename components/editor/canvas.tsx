"use client"

import { useCallback } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useMindmapContext } from '@/contexts/mindmap/MindmapContext'

// Custom node component
function CustomNode({ data }: any) {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-card border-2 border-primary">
      <div className="text-sm font-semibold text-foreground">{data.label}</div>
    </div>
  )
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
}

export default function Canvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
  } = useMindmapContext()

  const onNodeClick = useCallback(
    (_event: any, node: any) => {
      setSelectedNode(node)
    },
    [setSelectedNode]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  )
}
