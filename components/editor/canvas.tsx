"use client"

import { useCallback, useMemo, useEffect, useRef } from 'react'
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
    selectedNode,
    selectedEdge,
    deleteNode,
    deleteEdge,
    addNode,
  } = useMindmapContext()

  // Ref to track pending child node ID to select after creation
  const pendingChildNodeId = useRef<string | null>(null)

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

  // Effect to select newly created child node
  useEffect(() => {
    if (pendingChildNodeId.current) {
      const newNode = nodes.find(n => n.id === pendingChildNodeId.current)
      if (newNode) {
        setSelectedNode(newNode)
        pendingChildNodeId.current = null
      }
    }
  }, [nodes, setSelectedNode])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Tab key - Add child node
      if (event.key === 'Tab' && selectedNode) {
        event.preventDefault()
        
        // Calculate position for child node (below parent with offset)
        const childOffset = 150 // Distance between parent and child
        const childPosition = {
          x: selectedNode.position.x,
          y: selectedNode.position.y + childOffset,
        }

        // Get shape from parent node or default to rectangle
        const childShape = selectedNode.type || selectedNode.data?.shape || 'rectangle'

        // Create child node and get its ID
        const childNodeId = addNode(childPosition, childShape)
        
        // Store the child node ID to select it after it's added to the nodes array
        pendingChildNodeId.current = childNodeId

        // Connect parent to child
        // Use setTimeout to ensure the node is added to the state before connecting
        setTimeout(() => {
          onConnect({
            source: selectedNode.id,
            target: childNodeId,
            sourceHandle: null,
            targetHandle: null,
          })
        }, 10)
      }

      // Delete key or Backspace
      if (event.key === 'Delete' || event.key === 'Backspace') {
        // Prevent default browser back navigation on Backspace
        if (event.key === 'Backspace') {
          event.preventDefault()
        }
        
        if (selectedNode) {
          deleteNode(selectedNode.id)
        } else if (selectedEdge) {
          deleteEdge(selectedEdge.id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode, selectedEdge, deleteNode, deleteEdge, addNode, onConnect])

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
