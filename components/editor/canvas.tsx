"use client"

import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useReactFlow,
  ReactFlowInstance,
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

// Component for directional arrow buttons
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
        className="w-8 h-8 rounded-full bg-primary/90 text-primary-foreground shadow-lg hover:bg-primary transition-all flex items-center justify-center border-2 border-background backdrop-blur-sm"
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
  
  // Ref to track pending sibling node ID to select after creation
  const pendingSiblingNodeId = useRef<string | null>(null)
  
  // Ref to store ReactFlow instance
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  
  // State for hover detection with delay
  const [hoveredNode, setHoveredNode] = useState<{
    id: string
    screenPositions: {
      top: { x: number; y: number }
      right: { x: number; y: number }
      bottom: { x: number; y: number }
      left: { x: number; y: number }
    }
  } | null>(null)
  
  const hoverTimer = useRef<NodeJS.Timeout | null>(null)
  const hideTimer = useRef<NodeJS.Timeout | null>(null)
  const hoveredNodeId = useRef<string | null>(null)

  // Calculate screen positions for 4 directional buttons around a node
  const calculateDirectionPositions = useCallback((node: any) => {
    if (!reactFlowInstance.current || !node) return null
    
    const viewport = reactFlowInstance.current.getViewport()
    const nodeWidth = node.width || 150
    const nodeHeight = node.height || 50
    const offset = 40 // Distance from node edge
    
    // Calculate node center in screen coordinates
    const nodeCenterX = (node.position.x * viewport.zoom) + viewport.x + (nodeWidth * viewport.zoom) / 2
    const nodeCenterY = (node.position.y * viewport.zoom) + viewport.y + (nodeHeight * viewport.zoom) / 2
    
    return {
      top: {
        x: nodeCenterX,
        y: nodeCenterY - (nodeHeight * viewport.zoom) / 2 - offset
      },
      right: {
        x: nodeCenterX + (nodeWidth * viewport.zoom) / 2 + offset,
        y: nodeCenterY
      },
      bottom: {
        x: nodeCenterX,
        y: nodeCenterY + (nodeHeight * viewport.zoom) / 2 + offset
      },
      left: {
        x: nodeCenterX - (nodeWidth * viewport.zoom) / 2 - offset,
        y: nodeCenterY
      }
    }
  }, [])

  // Handle node hover with delay
  const handleNodeMouseEnter = useCallback((nodeId: string) => {
    // Clear any existing timers
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current)
    }
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
    }
    
    hoveredNodeId.current = nodeId
    
    // Delay 0.5-1 second before showing buttons (using 750ms as middle ground)
    hoverTimer.current = setTimeout(() => {
      const node = nodes.find(n => n.id === nodeId)
      if (node && hoveredNodeId.current === nodeId) {
        const positions = calculateDirectionPositions(node)
        if (positions) {
          setHoveredNode({
            id: nodeId,
            screenPositions: positions
          })
        }
      }
    }, 750) // 750ms delay
  }, [nodes, calculateDirectionPositions])

  const handleNodeMouseLeave = useCallback(() => {
    // Clear hover timer if still waiting
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current)
      hoverTimer.current = null
    }
    
    hoveredNodeId.current = null
    
    // Hide buttons after 200-300ms delay (using 250ms)
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
    }
    
    hideTimer.current = setTimeout(() => {
      setHoveredNode(null)
    }, 250) // 250ms delay before hiding
  }, [])

  // Create node types - hover will be handled by ReactFlow's onNodeMouseEnter/onNodeMouseLeave
  const nodeTypes = useMemo(() => {
    return {
      rectangle: RectangleNode,
      circle: CircleNode,
      diamond: DiamondNode,
      hexagon: HexagonNode,
      ellipse: EllipseNode,
      roundedRectangle: RoundedRectangleNode,
    }
  }, [])

  const defaultEdgeOptions = {
    animated: true,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }

  // Helper function to create child node in a specific direction
  const createChildNodeInDirection = useCallback((
    parentNode: any,
    direction: 'top' | 'right' | 'bottom' | 'left'
  ) => {
    const childOffset = 150 // Distance between parent and child
    
    let childPosition: { x: number; y: number }
    
    switch (direction) {
      case 'top':
        childPosition = {
          x: parentNode.position.x,
          y: parentNode.position.y - childOffset,
        }
        break
      case 'right':
        childPosition = {
          x: parentNode.position.x + childOffset,
          y: parentNode.position.y,
        }
        break
      case 'bottom':
        childPosition = {
          x: parentNode.position.x,
          y: parentNode.position.y + childOffset,
        }
        break
      case 'left':
        childPosition = {
          x: parentNode.position.x - childOffset,
          y: parentNode.position.y,
        }
        break
    }

    // Get shape from parent node or default to rectangle
    const childShape = parentNode.type || parentNode.data?.shape || 'rectangle'

    // Create child node and get its ID
    const childNodeId = addNode(childPosition, childShape)
    
    // Store the child node ID to select it after it's added to the nodes array
    pendingChildNodeId.current = childNodeId

    // Connect parent to child
    // Use setTimeout to ensure the node is added to the state before connecting
    setTimeout(() => {
      onConnect({
        source: parentNode.id,
        target: childNodeId,
        sourceHandle: null,
        targetHandle: null,
      })
    }, 10)
    
    // Hide buttons after creating node
    setHoveredNode(null)
  }, [addNode, onConnect])

  // Legacy function for backward compatibility
  const createChildNode = useCallback((parentNode: any) => {
    createChildNodeInDirection(parentNode, 'bottom')
  }, [createChildNodeInDirection])

  // Helper function to create sibling node
  const createSiblingNode = useCallback((currentNode: any) => {
    // Find parent node by finding edge where currentNode is the target
    const parentEdge = edges.find(edge => edge.target === currentNode.id)
    const parentNode = parentEdge ? nodes.find(n => n.id === parentEdge.source) : null

    // Calculate position for sibling node
    // Position it to the right of the current node, or below if it's a root node
    const siblingOffset = 200 // Horizontal distance between siblings
    const verticalOffset = 150 // Vertical distance for root nodes
    
    let siblingPosition: { x: number; y: number }
    
    if (parentNode) {
      // Has parent: position to the right
      siblingPosition = {
        x: currentNode.position.x + siblingOffset,
        y: currentNode.position.y,
      }
    } else {
      // Root node: position below
      siblingPosition = {
        x: currentNode.position.x,
        y: currentNode.position.y + verticalOffset,
      }
    }

    // Get shape from current node or default to rectangle
    const siblingShape = currentNode.type || currentNode.data?.shape || 'rectangle'

    // Create sibling node and get its ID
    const siblingNodeId = addNode(siblingPosition, siblingShape)
    
    // Store the sibling node ID to select it after it's added to the nodes array
    pendingSiblingNodeId.current = siblingNodeId

    // If there's a parent, connect the new sibling to the same parent
    if (parentNode) {
      setTimeout(() => {
        onConnect({
          source: parentNode.id,
          target: siblingNodeId,
          sourceHandle: null,
          targetHandle: null,
        })
      }, 10)
    }
  }, [nodes, edges, addNode, onConnect])

  const onNodeClick = useCallback(
    (_event: any, node: any) => {
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

  // Effect to select newly created child or sibling node and enable editing
  useEffect(() => {
    if (pendingChildNodeId.current) {
      const newNode = nodes.find(n => n.id === pendingChildNodeId.current)
      if (newNode) {
        setSelectedNode(newNode)
        // Enable editing mode for the new node
        updateNodeData(newNode.id, { isEditing: true })
        pendingChildNodeId.current = null
      }
    }
    if (pendingSiblingNodeId.current) {
      const newNode = nodes.find(n => n.id === pendingSiblingNodeId.current)
      if (newNode) {
        setSelectedNode(newNode)
        // Enable editing mode for the new node
        updateNodeData(newNode.id, { isEditing: true })
        pendingSiblingNodeId.current = null
      }
    }
  }, [nodes, setSelectedNode, updateNodeData])

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
        createChildNode(selectedNode)
      }

      // Enter key - Add sibling node
      if (event.key === 'Enter' && selectedNode) {
        event.preventDefault()
        createSiblingNode(selectedNode)
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
  }, [selectedNode, selectedEdge, deleteNode, deleteEdge,addNode, onConnect, undo, redo, canUndo, canRedo, createChildNode, createSiblingNode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverTimer.current) {
        clearTimeout(hoverTimer.current)
      }
      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
      }
    }
  }, [])

  // Update button positions when viewport changes
  useEffect(() => {
    if (hoveredNode) {
      const node = nodes.find(n => n.id === hoveredNode.id)
      if (node) {
        const positions = calculateDirectionPositions(node)
        if (positions) {
          setHoveredNode({
            id: hoveredNode.id,
            screenPositions: positions
          })
        }
      }
    }
  }, [hoveredNode, nodes, calculateDirectionPositions])

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMoveEnd={handleMoveEnd}
        onInit={(instance) => {
          reactFlowInstance.current = instance
        }}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeMouseEnter={(_event, node) => handleNodeMouseEnter(node.id)}
        onNodeMouseLeave={handleNodeMouseLeave}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onMove={() => {
          // Update button positions when viewport changes
          if (hoveredNode) {
            const node = nodes.find(n => n.id === hoveredNode.id)
            if (node) {
              const positions = calculateDirectionPositions(node)
              if (positions) {
                setHoveredNode({
                  id: hoveredNode.id,
                  screenPositions: positions
                })
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
      
      {/* Directional arrow buttons overlay */}
      {hoveredNode && (
        <>
          <DirectionButton
            screenPosition={hoveredNode.screenPositions.top}
            title="Thêm node phía trên"
            direction="top"
            onClick={() => {
              const parent = nodes.find(n => n.id === hoveredNode.id)
              if (parent) {
                createChildNodeInDirection(parent, 'top')
              }
            }}
          />
          <DirectionButton
            screenPosition={hoveredNode.screenPositions.right}
            title="Thêm node bên phải"
            direction="right"
            onClick={() => {
              const parent = nodes.find(n => n.id === hoveredNode.id)
              if (parent) {
                createChildNodeInDirection(parent, 'right')
              }
            }}
          />
          <DirectionButton
            screenPosition={hoveredNode.screenPositions.bottom}
            title="Thêm node phía dưới"
            direction="bottom"
            onClick={() => {
              const parent = nodes.find(n => n.id === hoveredNode.id)
              if (parent) {
                createChildNodeInDirection(parent, 'bottom')
              }
            }}
          />
          <DirectionButton
            screenPosition={hoveredNode.screenPositions.left}
            title="Thêm node bên trái"
            direction="left"
            onClick={() => {
              const parent = nodes.find(n => n.id === hoveredNode.id)
              if (parent) {
                createChildNodeInDirection(parent, 'left')
              }
            }}
          />
        </>
      )}
    </div>
  )
}
