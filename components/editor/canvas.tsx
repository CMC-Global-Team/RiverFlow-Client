"use client"

import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  ReactFlowInstance,
  Position,
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
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft } from 'lucide-react'

// (Old AddChildButton removed)

// Arrow button used for node-hover directional add
function DirectionButton({
  screenPosition,
  onClick,
  title,
  direction,
}: {
  screenPosition: { x: number; y: number }
  onClick: () => void
  title: string
  direction: 'top' | 'right' | 'bottom' | 'left'
}) {
  const Icon = direction === 'top' ? ArrowUp : direction === 'right' ? ArrowRight : direction === 'bottom' ? ArrowDown : ArrowLeft
  return (
    <div
      className="absolute z-50 pointer-events-auto"
      style={{
        left: `${screenPosition.x}px`,
        top: `${screenPosition.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <button
        className="w-7 h-7 rounded-full bg-primary/90 text-primary-foreground shadow hover:bg-primary transition-all flex items-center justify-center border-2 border-background"
        title={title}
      >
        <Icon className="w-4 h-4" />
      </button>
    </div>
  )
}

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
    onViewportChange,
    undo,
    redo,
    canUndo,
    canRedo,
    updateNodeData,
  } = useMindmapContext()

  const { getViewport } = useReactFlow();

  const handleMoveEnd = useCallback(() => {
    if (onViewportChange) {
        onViewportChange(getViewport());
    }
  }, [getViewport, onViewportChange]);

  // Ref to track pending child node ID to select after creation
  const pendingChildNodeId = useRef<string | null>(null)
  
  // Ref to store ReactFlow instance
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  
  // (Old handle-hover state removed)

  // State for node hover to show 4 directional buttons
  const [hoveredNode, setHoveredNode] = useState<{
    nodeId: string
    screenPositions: {
      top: { x: number; y: number }
      right: { x: number; y: number }
      bottom: { x: number; y: number }
      left: { x: number; y: number }
    }
  } | null>(null)

  // Calculate screen position for handle - position button right next to the handle
  const calculateHandleScreenPosition = useCallback((
    nodePosition: { x: number; y: number },
    handlePosition: string,
    nodeBounds?: { width: number; height: number }
  ) => {
    if (!reactFlowInstance.current) {
      console.warn('ReactFlow instance not available')
      return null
    }
    
    const viewport = reactFlowInstance.current.getViewport()
    const nodeWidth = nodeBounds?.width || 150
    const nodeHeight = nodeBounds?.height || 50
    
    // Calculate node top-left corner in screen coordinates
    const nodeScreenX = (nodePosition.x * viewport.zoom) + viewport.x
    const nodeScreenY = (nodePosition.y * viewport.zoom) + viewport.y
    
    // Calculate handle position on the node edge, then add offset for button
    let handleX = 0
    let handleY = 0
    let buttonOffsetX = 0
    let buttonOffsetY = 0
    
    console.log('Position mapping:', { handlePosition, nodeScreenX, nodeScreenY, nodeWidth, nodeHeight })
    
    switch (handlePosition) {
      case 'top':
        // Handle is at top center of node
        handleX = nodeScreenX + (nodeWidth / 2) * viewport.zoom
        handleY = nodeScreenY
        // Button appears above the handle
        buttonOffsetX = 0
        buttonOffsetY = -25 // 25px above handle
        break
      case 'right':
        // Handle is at right center of node
        handleX = nodeScreenX + nodeWidth * viewport.zoom
        handleY = nodeScreenY + (nodeHeight / 2) * viewport.zoom
        // Button appears to the right of the handle
        buttonOffsetX = 25 // 25px to the right
        buttonOffsetY = 0
        break
      case 'bottom':
        // Handle is at bottom center of node
        handleX = nodeScreenX + (nodeWidth / 2) * viewport.zoom
        handleY = nodeScreenY + nodeHeight * viewport.zoom
        // Button appears below the handle
        buttonOffsetX = 0
        buttonOffsetY = 25 // 25px below handle
        break
      case 'left':
        // Handle is at left center of node
        handleX = nodeScreenX
        handleY = nodeScreenY + (nodeHeight / 2) * viewport.zoom
        // Button appears to the left of the handle
        buttonOffsetX = -25 // 25px to the left
        buttonOffsetY = 0
        break
      default:
        console.warn('Unknown handle position:', handlePosition)
        handleX = nodeScreenX + nodeWidth * viewport.zoom
        handleY = nodeScreenY + (nodeHeight / 2) * viewport.zoom
        buttonOffsetX = 25
        buttonOffsetY = 0
    }
    
    const screenPos = {
      x: handleX + buttonOffsetX,
      y: handleY + buttonOffsetY
    }
    
    console.log('Calculated screen position:', { handleX, handleY, buttonOffsetX, buttonOffsetY, screenPos })
    return screenPos
  }, [])

  // (Old handle-hover handlers removed)

  // Node hover handlers to compute all 4 positions and show buttons immediately
  const handleNodeHoverChange = useCallback((nodeId: string, isHovering: boolean) => {
    if (!isHovering) {
      setHoveredNode(null)
      return
    }
    const parentNode = nodes.find(n => n.id === nodeId)
    if (!parentNode) return
    const bounds = { width: parentNode.width || 150, height: parentNode.height || 50 }
    const top = calculateHandleScreenPosition(parentNode.position, 'top', bounds)
    const right = calculateHandleScreenPosition(parentNode.position, 'right', bounds)
    const bottom = calculateHandleScreenPosition(parentNode.position, 'bottom', bounds)
    const left = calculateHandleScreenPosition(parentNode.position, 'left', bounds)
    if (top && right && bottom && left) {
      setHoveredNode({
        nodeId,
        screenPositions: { top, right, bottom, left },
      })
    }
  }, [nodes, calculateHandleScreenPosition])

  // Create node types with handle hover handlers
  const nodeTypes = useMemo(() => {
    const createNodeWithHandlers = (NodeComponent: any) => {
      const WrappedNode = (props: any) => {
        // Only pass valid ReactFlow props and our custom handlers
        const { id, data, selected, position, type, ...restProps } = props
        return (
          <NodeComponent
            id={id}
            data={data}
            selected={selected}
            position={position}
            type={type}
            onNodeHoverChange={handleNodeHoverChange}
          />
        )
      }
      WrappedNode.displayName = `Wrapped${NodeComponent.displayName || 'Node'}`
      return WrappedNode
    }

    return {
      rectangle: createNodeWithHandlers(RectangleNode),
      circle: createNodeWithHandlers(CircleNode),
      diamond: createNodeWithHandlers(DiamondNode),
      hexagon: createNodeWithHandlers(HexagonNode),
      ellipse: createNodeWithHandlers(EllipseNode),
      roundedRectangle: createNodeWithHandlers(RoundedRectangleNode),
    }
  }, [handleNodeHoverChange])

  const defaultEdgeOptions = {
    animated: true,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }

  // Helper function to create child node connected to a specific handle
  const createChildNode = useCallback((
    parentNode: any,
    handlePosition: string,
    handleType: 'source' | 'target',
    handleId: string
  ) => {
    // Calculate position for child node based on handle position
    const childOffset = 150 // Distance between parent and child
    let childPosition = { x: parentNode.position.x, y: parentNode.position.y }
    
    switch (handlePosition) {
      case 'top':
        childPosition = {
          x: parentNode.position.x,
          y: parentNode.position.y - childOffset
        }
        break
      case 'right':
        childPosition = {
          x: parentNode.position.x + childOffset,
          y: parentNode.position.y
        }
        break
      case 'bottom':
        childPosition = {
          x: parentNode.position.x,
          y: parentNode.position.y + childOffset
        }
        break
      case 'left':
        childPosition = {
          x: parentNode.position.x - childOffset,
          y: parentNode.position.y
        }
        break
    }

    // Get shape from parent node or default to rectangle
    const childShape = parentNode.type || parentNode.data?.shape || 'rectangle'

    // Create child node and get its ID
    const childNodeId = addNode(childPosition, childShape)
    
    // Store the child node ID to select it after it's added to the nodes array
    pendingChildNodeId.current = childNodeId

    // Connect parent to child using the specific handle
    // Use setTimeout to ensure the node is added to the state before connecting
    setTimeout(() => {
      if (handleType === 'source') {
        // Parent is source, child is target
        onConnect({
          source: parentNode.id,
          target: childNodeId,
          sourceHandle: handleId,
          targetHandle: null, // Will connect to any target handle
        })
      } else {
        // Parent is target, child is source (reverse connection)
        onConnect({
          source: childNodeId,
          target: parentNode.id,
          sourceHandle: null,
          targetHandle: handleId,
        })
      }
    }, 10)
  }, [addNode, onConnect])

  const onNodeClick = useCallback(
    (_event: any, node: any) => {
      setHoveredNode(null)
      
      setSelectedNode(node)
      setSelectedEdge(null)
    },
    [setSelectedNode, setSelectedEdge]
  )

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      updateNodeData(node.id, { isEditing: true })
    },
    [updateNodeData]
  )

  const onEdgeClick = useCallback(
    (_event: any, edge: any) => {
      setSelectedEdge(edge)
      setSelectedNode(null)
    },
    [setSelectedEdge, setSelectedNode]
  )

  const onPaneClick = useCallback(() => {
    setHoveredNode(null)
    
    setSelectedNode(null)
    setSelectedEdge(null)
  }, [setSelectedNode, setSelectedEdge])

  // Effect to select newly created child node and focus it for editing
  useEffect(() => {
    if (pendingChildNodeId.current) {
      const newNode = nodes.find(n => n.id === pendingChildNodeId.current)
      if (newNode) {
        setSelectedNode(newNode)
        // Focus the node for immediate editing
        // The node will be selected and ready for content input
        pendingChildNodeId.current = null
        
        // Optionally, you can scroll to the new node
        if (reactFlowInstance.current) {
          reactFlowInstance.current.fitView({
            nodes: [{ id: newNode.id }],
            padding: 0.2,
            duration: 300,
          })
        }
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

      const isCtrlOrCmd = event.ctrlKey || event.metaKey

      // Tab key - Add child node
      if (event.key === 'Tab' && selectedNode) {
        event.preventDefault()
        // Default to bottom handle for Tab key
        createChildNode(selectedNode, 'bottom', 'source', 'source-bottom')
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

      if (isCtrlOrCmd && event.key === 'z') {
        event.preventDefault();
        if (canUndo) {
            undo();
        }
      }

      if (
          (isCtrlOrCmd && event.key === 'y') || // Ctrl+Y
          (isCtrlOrCmd && event.shiftKey && event.key === 'z') // Ctrl+Shift+Z
         ) {
        event.preventDefault();
        if (canRedo) {
            redo();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode, selectedEdge, deleteNode, deleteEdge, createChildNode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
    }
  }, [])

  // (Old plus-button helpers removed)

  return (
    <div className="w-full h-full relative">
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => {
          reactFlowInstance.current = instance
        }}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onMove={() => {
          if (hoveredNode && reactFlowInstance.current) {
            const parentNode = nodes.find(n => n.id === hoveredNode.nodeId)
            if (parentNode) {
              const bounds = { width: parentNode.width || 150, height: parentNode.height || 50 }
              const top = calculateHandleScreenPosition(parentNode.position, 'top', bounds)
              const right = calculateHandleScreenPosition(parentNode.position, 'right', bounds)
              const bottom = calculateHandleScreenPosition(parentNode.position, 'bottom', bounds)
              const left = calculateHandleScreenPosition(parentNode.position, 'left', bounds)
              if (top && right && bottom && left) {
                setHoveredNode(prev => prev ? {
                  nodeId: prev.nodeId,
                  screenPositions: { top, right, bottom, left },
                } : null)
              }
            }
          }
        }}
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

      {/* Node-hover directional buttons */}
      {hoveredNode && (
        <>
          <DirectionButton
            screenPosition={hoveredNode.screenPositions.top}
            title="Thêm node phía trên"
            direction="top"
            onClick={() => {
              const parent = nodes.find(n => n.id === hoveredNode.nodeId)
              if (parent) createChildNode(parent, 'top', 'target', 'target-top')
            }}
          />
          <DirectionButton
            screenPosition={hoveredNode.screenPositions.right}
            title="Thêm node bên phải"
            direction="right"
            onClick={() => {
              const parent = nodes.find(n => n.id === hoveredNode.nodeId)
              if (parent) createChildNode(parent, 'right', 'target', 'target-right')
            }}
          />
          <DirectionButton
            screenPosition={hoveredNode.screenPositions.bottom}
            title="Thêm node phía dưới"
            direction="bottom"
            onClick={() => {
              const parent = nodes.find(n => n.id === hoveredNode.nodeId)
              if (parent) createChildNode(parent, 'bottom', 'source', 'source-bottom')
            }}
          />
          <DirectionButton
            screenPosition={hoveredNode.screenPositions.left}
            title="Thêm node bên trái"
            direction="left"
            onClick={() => {
              const parent = nodes.find(n => n.id === hoveredNode.nodeId)
              if (parent) createChildNode(parent, 'left', 'source', 'source-left')
            }}
          />
        </>
      )}
    </div>
  )
}
