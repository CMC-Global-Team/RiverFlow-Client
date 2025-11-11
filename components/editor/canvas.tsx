"use client"

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
import { Plus } from 'lucide-react'

// Component to handle add button
function AddChildButton({ screenPosition, onAddChild, onClose }: {
  screenPosition: { x: number; y: number }
  onAddChild: () => void
  onClose: () => void
}) {
  // Ensure screenPosition is valid
  if (!screenPosition || typeof screenPosition.x !== 'number' || typeof screenPosition.y !== 'number') {
    return null
  }

  return (
    <div
      className="absolute z-50 pointer-events-auto"
      style={{
        left: `${screenPosition.x}px`,
        top: `${screenPosition.y}px`,
        transform: 'translate(-50%, -50%)', // Center both horizontally and vertically
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        e.stopPropagation()
        onAddChild()
        onClose()
      }}
      onMouseDown={(e) => {
        // Prevent triggering node click when clicking the button
        e.stopPropagation()
      }}
    >
      <button
        className="w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center border-2 border-background hover:scale-110"
        title="Thêm node con"
      >
        <Plus className="w-4 h-4" />
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
  } = useMindmapContext()

  // Ref to track pending child node ID to select after creation
  const pendingChildNodeId = useRef<string | null>(null)
  
  // Ref to store ReactFlow instance
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  
  // State for handle hover detection
  const [hoveredHandle, setHoveredHandle] = useState<{
    nodeId: string
    handleId: string
    handlePosition: string
    handleType: 'source' | 'target'
    screenPosition: { x: number; y: number }
  } | null>(null)
  const handleHoverTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())

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

  // Handle handle hover (when hovering over a handle)
  const handleHandleHover = useCallback((
    nodeId: string,
    handleId: string,
    handlePosition: string,
    handleType: 'source' | 'target',
    event: React.MouseEvent
  ) => {
    console.log('handleHandleHover called:', { nodeId, handleId, handlePosition, handleType })
    const timerKey = `${nodeId}-${handleId}`
    
    // Clear any existing timer for this handle
    const existingTimer = handleHoverTimers.current.get(timerKey)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    
    // Store mouse position from event for accurate button placement
    const mouseX = event.clientX
    const mouseY = event.clientY
    
    // Start new timer for this handle (1 second)
    const timer = setTimeout(() => {
      console.log('Timer fired for handle:', { nodeId, handleId, handlePosition })
      const parentNode = nodes.find(n => n.id === nodeId)
      if (parentNode && reactFlowInstance.current) {
        // Calculate button position relative to mouse position (handle location)
        // Place button right next to the handle (smaller offset for closer placement)
        let buttonX = mouseX
        let buttonY = mouseY
        
        // Add small offset based on handle position to place button right next to handle
        switch (handlePosition) {
          case 'top':
            buttonY = mouseY - 20 // Right above handle
            break
          case 'right':
            buttonX = mouseX + 20 // Right next to handle
            break
          case 'bottom':
            buttonY = mouseY + 20 // Right below handle
            break
          case 'left':
            buttonX = mouseX - 20 // Right next to handle (left side)
            break
        }
        
        const screenPos = {
          x: buttonX,
          y: buttonY
        }
        
        console.log('Screen position calculated from mouse:', { mouseX, mouseY, buttonX, buttonY, screenPos })
        
        const newHoveredHandle = {
          nodeId,
          handleId,
          handlePosition,
          handleType,
          screenPosition: screenPos
        }
        console.log('Setting hovered handle:', newHoveredHandle)
        setHoveredHandle(newHoveredHandle)
        console.log('Hovered handle set successfully')
      } else {
        console.warn('Parent node or ReactFlow instance not found:', { 
          parentNode: !!parentNode, 
          reactFlowInstance: !!reactFlowInstance.current 
        })
      }
      handleHoverTimers.current.delete(timerKey)
    }, 1000) // 1 giây
    
    handleHoverTimers.current.set(timerKey, timer)
  }, [nodes, calculateHandleScreenPosition])

  // Handle handle leave
  const handleHandleLeave = useCallback((nodeId: string, handleId: string) => {
    const timerKey = `${nodeId}-${handleId}`
    
    // Clear timer for this handle
    const timer = handleHoverTimers.current.get(timerKey)
    if (timer) {
      clearTimeout(timer)
      handleHoverTimers.current.delete(timerKey)
    }
  }, [])

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
            onHandleHover={handleHandleHover}
            onHandleLeave={handleHandleLeave}
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
  }, [handleHandleHover, handleHandleLeave])

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
      // Clear handle hover button when clicking on a node
      setHoveredHandle(null)
      
      // Clear any hover timers
      handleHoverTimers.current.forEach((timer) => clearTimeout(timer))
      handleHoverTimers.current.clear()
      
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
    // Clear handle hover button when clicking on pane
    setHoveredHandle(null)
    
    // Clear any hover timers
    handleHoverTimers.current.forEach((timer) => clearTimeout(timer))
    handleHoverTimers.current.clear()
    
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
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode, selectedEdge, deleteNode, deleteEdge, createChildNode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all hover timers
      handleHoverTimers.current.forEach((timer) => clearTimeout(timer))
      handleHoverTimers.current.clear()
    }
  }, [])

  const handleAddChildFromButton = useCallback(() => {
    if (hoveredHandle) {
      const parentNode = nodes.find(n => n.id === hoveredHandle.nodeId)
      if (parentNode) {
        createChildNode(
          parentNode,
          hoveredHandle.handlePosition,
          hoveredHandle.handleType,
          hoveredHandle.handleId
        )
      }
    }
  }, [hoveredHandle, nodes, createChildNode])

  const handleCloseAddButton = useCallback(() => {
    setHoveredHandle(null)
  }, [])

  // Note: screenPosition is calculated when timer fires, no need for separate useEffect

  return (
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
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onMove={() => {
          // Update button position when panning/zooming
          if (hoveredHandle && reactFlowInstance.current) {
            const parentNode = nodes.find(n => n.id === hoveredHandle.nodeId)
            if (parentNode) {
              const screenPos = calculateHandleScreenPosition(
                parentNode.position,
                hoveredHandle.handlePosition,
                {
                  width: parentNode.width || 150,
                  height: parentNode.height || 50
                }
              )
              if (screenPos && (
                !hoveredHandle.screenPosition ||
                Math.abs(hoveredHandle.screenPosition.x - screenPos.x) > 1 ||
                Math.abs(hoveredHandle.screenPosition.y - screenPos.y) > 1
              )) {
                // Only update if position changed significantly to avoid excessive updates
                setHoveredHandle(prev => prev ? { ...prev, screenPosition: screenPos } : null)
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
      
      {/* Add child button overlay */}
      {hoveredHandle && hoveredHandle.screenPosition && (
        <AddChildButton
          screenPosition={hoveredHandle.screenPosition}
          onAddChild={handleAddChildFromButton}
          onClose={handleCloseAddButton}
        />
      )}
    </div>
  )
}
