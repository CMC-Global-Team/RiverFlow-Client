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
import { Plus } from 'lucide-react'

const LONG_PRESS_DELAY = 1000 // ms
const BUTTON_HIDE_DELAY = 500 // ms

// Component to handle add button
function AddChildButton({ screenPosition, onAddChild, onClose, onStayVisible, onScheduleHide }: {
  screenPosition: { x: number; y: number }
  onAddChild: () => void
  onClose: () => void
  onStayVisible: () => void
  onScheduleHide: () => void
}) {
  return (
    <div
      className="absolute z-50 pointer-events-auto"
      style={{
        left: `${screenPosition.x}px`,
        top: `${screenPosition.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
      onClick={(e) => {
        e.stopPropagation()
        onAddChild()
        onClose()
      }}
      onMouseEnter={(e) => {
        e.stopPropagation()
        onStayVisible()
      }}
      onMouseLeave={(e) => {
        e.stopPropagation()
        onScheduleHide()
      }}
    >
      <button
        className="w-8 h-8 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center border-2 border-background"
        title="Thêm node con"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function Canvas({ readOnly = false }: { readOnly?: boolean }) {
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
  
  // State for long press detection
  const [longPressedNode, setLongPressedNode] = useState<{ id: string; position: { x: number; y: number }; dimensions: { width?: number; height?: number } } | null>(null)
  const [buttonScreenPosition, setButtonScreenPosition] = useState<{ x: number; y: number } | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const longPressNodeRef = useRef<string | null>(null)
  const hideButtonTimer = useRef<NodeJS.Timeout | null>(null)

  // Calculate screen position from flow position
  const calculateScreenPosition = useCallback(
    (flowPosition?: { x?: number; y?: number }, dimensions: { width?: number; height?: number } = {}) => {
      if (!reactFlowInstance.current || !flowPosition) return null

      const { x, y } = flowPosition
      if (typeof x !== "number" || typeof y !== "number") {
        return null
      }

      const viewport = reactFlowInstance.current.getViewport()
      // Sử dụng kích thước mặc định an toàn cho các loại node
      const width = dimensions.width ?? 150
      const height = dimensions.height ?? 80

      const nodeRightEdge = x + width
      const nodeMiddleY = y + height / 2

      const screenX = nodeRightEdge * viewport.zoom + viewport.x + 24
      const screenY = nodeMiddleY * viewport.zoom + viewport.y

      return { x: screenX, y: screenY }
    },
    []
  )

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const clearHideButtonTimer = useCallback(() => {
    if (hideButtonTimer.current) {
      clearTimeout(hideButtonTimer.current)
      hideButtonTimer.current = null
    }
  }, [])

  const hideButton = useCallback(() => {
    setLongPressedNode(null)
    setButtonScreenPosition(null)
    clearHideButtonTimer()
  }, [clearHideButtonTimer])

  const scheduleHideButton = useCallback((nodeId?: string) => {
    clearHideButtonTimer()
    hideButtonTimer.current = setTimeout(() => {
      if (!nodeId || longPressedNode?.id === nodeId) {
        hideButton()
      }
    }, BUTTON_HIDE_DELAY)
  }, [clearHideButtonTimer, hideButton, longPressedNode])

  // Create node types with long press handlers - Disabled in read-only mode
  const nodeTypes = useMemo(() => {
    if (readOnly) {
      // In read-only mode, return nodes without long press handlers
      return {
        rectangle: RectangleNode,
        circle: CircleNode,
        diamond: DiamondNode,
        hexagon: HexagonNode,
        ellipse: EllipseNode,
        roundedRectangle: RoundedRectangleNode,
      }
    }

    const createNodeWithLongPress = (NodeComponent: any) => {
      const WrappedNode = (props: any) => {
        const triggerLongPress = () => {
          console.log('[AddChildButton] pointer enter on node', props.id)
          if (!reactFlowInstance.current) return

          const nodePosition =
            (props as { positionAbsolute?: { x?: number; y?: number } }).positionAbsolute ||
            (props as { position?: { x?: number; y?: number } }).position

          if (!nodePosition) {
            console.warn('[AddChildButton] missing node position for', props.id)
            return
          }

          const { x, y } = nodePosition
          if (typeof x !== "number" || typeof y !== "number") {
            console.warn('[AddChildButton] invalid node position values', { x, y, nodeId: props.id })
            return
          }
          // ReactFlow có thể không cung cấp width/height trong props
          // Sử dụng giá trị mặc định an toàn
          const nodeDimensions = { 
            width: (props as any).width || (props as any).measured?.width || 150,
            height: (props as any).height || (props as any).measured?.height || 80
          }
          console.log('[AddChildButton] long-press dimensions', { nodeId: props.id, nodeDimensions, position: { x, y } })
          setLongPressedNode({
            id: props.id,
            position: { x, y },
            dimensions: nodeDimensions,
          })
          const screenPos = calculateScreenPosition({ x, y }, nodeDimensions)
          if (screenPos) {
            console.log('[AddChildButton] computed screen position', screenPos)
            setButtonScreenPosition(screenPos)
          } else {
            console.warn('[AddChildButton] could not compute screen position', { nodeId: props.id })
          }
        }

        const handlePointerEnter = () => {
          clearLongPressTimer()
          clearHideButtonTimer()
          longPressNodeRef.current = props.id
          longPressTimer.current = setTimeout(() => {
            if (longPressNodeRef.current === props.id) {
              triggerLongPress()
            }
          }, LONG_PRESS_DELAY)
        }

        const handlePointerLeave = () => {
          clearLongPressTimer()
          longPressNodeRef.current = null
          if (longPressedNode?.id === props.id) {
            scheduleHideButton(props.id)
          }
        }

        const handlePointerDown = () => {
          clearLongPressTimer()
          scheduleHideButton(props.id)
        }

        return (
          <div
            onMouseEnter={handlePointerEnter}
            onMouseLeave={handlePointerLeave}
            onMouseDown={handlePointerDown}
          >
            <NodeComponent {...props} />
          </div>
        )
      }
      return WrappedNode
    }

    return {
      rectangle: createNodeWithLongPress(RectangleNode),
      circle: createNodeWithLongPress(CircleNode),
      diamond: createNodeWithLongPress(DiamondNode),
      hexagon: createNodeWithLongPress(HexagonNode),
      ellipse: createNodeWithLongPress(EllipseNode),
      roundedRectangle: createNodeWithLongPress(RoundedRectangleNode),
    }
  }, [readOnly, calculateScreenPosition, clearLongPressTimer, clearHideButtonTimer, scheduleHideButton, longPressedNode])

  const defaultEdgeOptions = {
    animated: true,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  }

  // Helper function to create child node
  const createChildNode = useCallback((parentNode: any) => {
    // Calculate position for child node (below parent with offset)
    const childOffset = 150 // Distance between parent and child
    const childPosition = {
      x: parentNode.position.x,
      y: parentNode.position.y + childOffset,
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
  }, [addNode, onConnect])

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
      if (!readOnly) {
        updateNodeData(node.id, { isEditing: true })
      }
    },
    [updateNodeData, readOnly]
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

  // Effect to select newly created child or sibling node and enable editing
  // Use a ref to track the previous nodes length to detect when new nodes are added
  const prevNodesLengthRef = useRef(nodes.length)
  
  useEffect(() => {
    // Only run if nodes length increased (new node added)
    if (nodes.length > prevNodesLengthRef.current) {
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
      prevNodesLengthRef.current = nodes.length
    } else if (nodes.length < prevNodesLengthRef.current) {
      // Update ref if nodes were deleted
      prevNodesLengthRef.current = nodes.length
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes.length]) // Only depend on nodes.length to prevent infinite loops

  // Keyboard shortcuts - Disabled in read-only mode
  useEffect(() => {
    if (readOnly) return // Don't register keyboard shortcuts in read-only mode

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
  }, [readOnly, selectedNode, selectedEdge, deleteNode, deleteEdge, addNode, onConnect, undo, redo, canUndo, canRedo, createChildNode, createSiblingNode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  const handleAddChildFromButton = useCallback(() => {
    if (longPressedNode) {
      const parentNode = nodes.find(n => n.id === longPressedNode.id)
      if (parentNode) {
        createChildNode(parentNode)
      }
    }
  }, [longPressedNode, nodes, createChildNode])

  const handleCloseAddButton = useCallback(() => {
    hideButton()
  }, [hideButton])

  const handleStayVisible = useCallback(() => {
    clearHideButtonTimer()
  }, [clearHideButtonTimer])

  const handleScheduleHide = useCallback(() => {
    scheduleHideButton(longPressedNode?.id)
  }, [scheduleHideButton, longPressedNode])

  // Update button position when long-pressed node changes
  useEffect(() => {
    if (longPressedNode && reactFlowInstance.current) {
      const screenPos = calculateScreenPosition(longPressedNode.position, longPressedNode.dimensions)
      if (screenPos) {
        setButtonScreenPosition(screenPos)
      }
    }
  }, [longPressedNode, calculateScreenPosition])

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onMoveEnd={handleMoveEnd}
        onInit={(instance) => {
          reactFlowInstance.current = instance
        }}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
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
      {longPressedNode && buttonScreenPosition && (
        <AddChildButton
          screenPosition={buttonScreenPosition}
          onAddChild={handleAddChildFromButton}
          onClose={handleCloseAddButton}
          onStayVisible={handleStayVisible}
          onScheduleHide={handleScheduleHide}
        />
      )}
    </div>
  )
}
