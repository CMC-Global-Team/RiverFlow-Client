"use client"

import { useCallback, useMemo, useEffect, useRef, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
  ReactFlowInstance,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useMindmapContext } from '@/contexts/mindmap/MindmapContext'
import { getSocket } from '@/lib/realtime'
import { useAuth } from '@/hooks/auth/useAuth'
import {
  RectangleNode,
  CircleNode,
  DiamondNode,
  HexagonNode,
  EllipseNode,
  RoundedRectangleNode,
} from './node-shapes'
import CustomEdge from './custom-edge'
import LinkPreviewModal from './link-preview-modal'
import { Plus, GitBranch, Trash2, Edit3, Square, Circle, Diamond, Hexagon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'

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



const edgeTypes = {
  default: (props: any) => <CustomEdge {...props} pathType="bezier" />,
  straight: (props: any) => <CustomEdge {...props} pathType="straight" />,
  step: (props: any) => <CustomEdge {...props} pathType="step" />,
  smoothstep: (props: any) => <CustomEdge {...props} pathType="smoothstep" />,
  bezier: (props: any) => <CustomEdge {...props} pathType="bezier" />,
}

export default function Canvas({ readOnly = false, hidePresence = false }: { readOnly?: boolean; hidePresence?: boolean }) {
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
    participants,
    announcePresence,
    emitCursor,
    emitActive,
    clearActive,
  } = useMindmapContext()

  const handleMoveEnd = useCallback(() => {
    if (onViewportChange && reactFlowInstance.current) {
      onViewportChange(reactFlowInstance.current.getViewport());
    }
  }, [onViewportChange]);

  // Ref to track pending child node ID to select after creation
  const pendingChildNodeId = useRef<string | null>(null)

  // Ref to track pending sibling node ID to select after creation
  const pendingSiblingNodeId = useRef<string | null>(null)

  // Ref to store ReactFlow instance
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  const myClientIdRef = useRef<string | null>(null)
  const presenceAnnouncedRef = useRef(false)
  const { user, isAuthenticated } = useAuth()
  const [anonymousName] = useState(() => {
    const names = ['Chuột túi', 'Cá mập', 'Chim kền kền', 'Gà trống', 'Chó pug', 'Cá voi', 'Mèo mun', 'Cáo lửa', 'Hươu sao', 'Rùa biển', 'Cú mèo', 'Bò tót']
    const i = Math.floor(Math.random() * names.length)
    return names[i]
  })
  const pickColor = useCallback((seed: string | number | null | undefined) => {
    const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#22c55e', '#06b6d4', '#f97316', '#a3e635']
    const s = String(seed || anonymousName)
    let h = 0
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
    return palette[h % palette.length]
  }, [anonymousName])

  // State for long press detection
  const [longPressedNode, setLongPressedNode] = useState<{ id: string; position: { x: number; y: number }; dimensions: { width?: number; height?: number } } | null>(null)
  const [buttonScreenPosition, setButtonScreenPosition] = useState<{ x: number; y: number } | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const longPressNodeRef = useRef<string | null>(null)
  const hideButtonTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // State for context menu
  const [contextMenuNode, setContextMenuNode] = useState<any | null>(null)
  const [contextMenuEdge, setContextMenuEdge] = useState<any | null>(null)
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null)

  // State for link preview modal
  const [linkPreview, setLinkPreview] = useState<{ isOpen: boolean; url: string; nodeLabel: string; position: { x: number; y: number } } | null>(null)

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
    zIndex: 1000, // Elevate edges above nodes to ensure arrow markers are visible when nodes are scaled
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
    (event: any, node: any) => {
      // In read-only mode, check if node has a link and show preview
      if (readOnly && node?.data?.link) {
        // Get click position for floating modal
        const clickPosition = {
          x: event.clientX || 200,
          y: event.clientY || 200,
        }
        setLinkPreview({
          isOpen: true,
          url: node.data.link,
          nodeLabel: node.data.label?.replace(/<[^>]*>/g, '') || 'Link Preview', // Strip HTML tags
          position: clickPosition,
        })
        return
      }
      setSelectedNode(node)
      setSelectedEdge(null)
      emitActive({ type: 'node', id: node?.id })
    },
    [readOnly, setSelectedNode, setSelectedEdge, emitActive]
  )

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      if (!readOnly) {
        updateNodeData(node.id, { isEditing: true })
        emitActive({ type: 'label', id: node?.id })
      }
    },
    [updateNodeData, readOnly, emitActive]
  )

  // Handle right-click context menu on nodes
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: any) => {
      // Prevent default browser context menu
      event.preventDefault()
      event.stopPropagation()
      if (!readOnly) {
        setContextMenuPosition({ x: event.clientX, y: event.clientY })
        setContextMenuNode(node)
        setContextMenuEdge(null)
        // Don't set selectedNode/selectedEdge to avoid opening properties panel
      }
    },
    [readOnly]
  )

  // Handle right-click context menu on edges
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: any) => {
      // Prevent default browser context menu
      event.preventDefault()
      event.stopPropagation()
      if (!readOnly) {
        setContextMenuPosition({ x: event.clientX, y: event.clientY })
        setContextMenuEdge(edge)
        setContextMenuNode(null)
        // Don't set selectedNode/selectedEdge to avoid opening properties panel
      }
    },
    [readOnly]
  )

  // Context menu action handlers
  const handleContextAddChild = useCallback(() => {
    if (contextMenuNode) {
      createChildNode(contextMenuNode)
      setContextMenuNode(null)
    }
  }, [contextMenuNode, createChildNode])

  const handleContextAddSibling = useCallback(() => {
    if (contextMenuNode) {
      createSiblingNode(contextMenuNode)
      setContextMenuNode(null)
    }
  }, [contextMenuNode, createSiblingNode])

  const handleContextEdit = useCallback(() => {
    if (contextMenuNode) {
      updateNodeData(contextMenuNode.id, { isEditing: true })
      emitActive({ type: 'label', id: contextMenuNode.id })
      setContextMenuNode(null)
    }
  }, [contextMenuNode, updateNodeData, emitActive])

  const handleContextDelete = useCallback(() => {
    if (contextMenuNode) {
      deleteNode(contextMenuNode.id)
      setContextMenuNode(null)
      setContextMenuPosition(null)
    }
  }, [contextMenuNode, deleteNode])

  const handleContextDeleteEdge = useCallback(() => {
    if (contextMenuEdge) {
      deleteEdge(contextMenuEdge.id)
      setContextMenuEdge(null)
      setContextMenuPosition(null)
    }
  }, [contextMenuEdge, deleteEdge])

  const handleContextAddNodeWithShape = useCallback((shape: string) => {
    if (contextMenuNode) {
      // Create child node with specific shape
      const childOffset = 150
      const childPosition = {
        x: contextMenuNode.position.x,
        y: contextMenuNode.position.y + childOffset,
      }
      const childNodeId = addNode(childPosition, shape)
      pendingChildNodeId.current = childNodeId
      setTimeout(() => {
        onConnect({
          source: contextMenuNode.id,
          target: childNodeId,
          sourceHandle: null,
          targetHandle: null,
        })
      }, 10)
      setContextMenuNode(null)
    }
  }, [contextMenuNode, addNode, onConnect])

  const onEdgeClick = useCallback(
    (_event: any, edge: any) => {
      setSelectedEdge(edge)
      setSelectedNode(null)
      emitActive({ type: 'edge', id: edge?.id })
    },
    [setSelectedEdge, setSelectedNode, emitActive]
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
    clearActive()
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

  useEffect(() => {
    const s = getSocket()
    myClientIdRef.current = s.id || null
  }, [])

  useEffect(() => {
    const s = getSocket()
    const handler = () => {
      if (presenceAnnouncedRef.current) return
      const name = isAuthenticated && user?.fullName ? user.fullName : anonymousName
      const color = pickColor(isAuthenticated ? user?.userId : null)
      announcePresence({ name, color, userId: isAuthenticated ? user?.userId : null, avatar: isAuthenticated ? user?.avatar || null : null })
      presenceAnnouncedRef.current = true
    }
    s.on('mindmap:joined', handler)
    return () => { s.off('mindmap:joined', handler) }
  }, [announcePresence, isAuthenticated, user, anonymousName, pickColor])

  const lastMouseScreenRef = useRef<{ x: number; y: number } | null>(null)
  const rafIdRef = useRef<number | null>(null)
  const runCursorRaf = useCallback(() => {
    const pos = lastMouseScreenRef.current
    if (pos && reactFlowInstance.current) {
      const flowPos = reactFlowInstance.current.screenToFlowPosition({ x: pos.x, y: pos.y })
      emitCursor({ x: flowPos.x, y: flowPos.y })
    }
    rafIdRef.current = requestAnimationFrame(runCursorRaf)
  }, [emitCursor])
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    lastMouseScreenRef.current = { x: e.clientX, y: e.clientY }
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(runCursorRaf)
    }
  }, [runCursorRaf])
  useEffect(() => {
    const handler = (e: any) => {
      lastMouseScreenRef.current = { x: e.clientX, y: e.clientY }
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(runCursorRaf)
      }
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handler)
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
    }
  }, [runCursorRaf])

  useEffect(() => {
    const handler = (e: any) => {
      lastMouseScreenRef.current = { x: e.clientX, y: e.clientY }
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(runCursorRaf)
      }
    }
    window.addEventListener('pointermove', handler, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handler)
    }
  }, [runCursorRaf])

  const toScreen = useCallback((p: { x: number; y: number }) => {
    if (!reactFlowInstance.current) return null
    const v = reactFlowInstance.current.getViewport()
    return { x: p.x * v.zoom + v.x, y: p.y * v.zoom + v.y }
  }, [])

  const renderPresence = useMemo(() => {
    if (!reactFlowInstance.current) return null
    const myId = myClientIdRef.current
    const items = Object.values(participants || {}).filter((p) => p.clientId !== myId)
    return (
      <>
        {items.map((p) => {
          const cs = p.cursor && toScreen(p.cursor)
          const cursorEl = cs ? (
            <div key={`cursor-${p.clientId}`} className="absolute z-40" style={{ left: cs.x, top: cs.y, transition: 'left 30ms linear, top 30ms linear', pointerEvents: 'none' }}>
              <div className="relative -translate-x-1 -translate-y-1">
                <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 3 L4 23 L11 16 L14 23 L16 22 L13 15 L24 15 Z" fill={p.color} stroke="#ffffff" strokeWidth="1.2" />
                </svg>
                <div className="mt-0.5 text-[10px]" style={{ color: '#ffffff', textShadow: `0 0 2px ${p.color}, 0 0 4px ${p.color}` }}>{p.name}</div>
              </div>
            </div>
          ) : null
          let highlightEl = null
          const a = p.active
          if (a && a.type === 'node' && a.id) {
            const inst = reactFlowInstance.current
            if (inst) {
              const n = inst.getNode(a.id)
              if (n) {
                const pos = n.positionAbsolute || n.position
                const v = inst.getViewport()
                const scale = (n.data as any)?.scale || 1
                const baseW = n.width ?? 150
                const baseH = n.height ?? 80
                const w = baseW * scale * v.zoom
                const h = baseH * scale * v.zoom
                const x = (pos.x - (baseW * (scale - 1)) / 2) * v.zoom + v.x
                const y = (pos.y - (baseH * (scale - 1)) / 2) * v.zoom + v.y
                const shape = (n.type as string) || (n.data as any)?.shape || 'rectangle'
                const box = (
                  <div className="w-full h-full" style={{ boxShadow: `0 0 0 3px ${p.color} inset` }}></div>
                )
                let overlay: any
                if (shape === 'rectangle') {
                  overlay = (
                    <div className="w-full h-full rounded-lg" style={{ boxShadow: `0 0 0 3px ${p.color} inset` }}></div>
                  )
                } else if (shape === 'roundedRectangle') {
                  overlay = (
                    <div className="w-full h-full rounded-3xl" style={{ boxShadow: `0 0 0 3px ${p.color} inset` }}></div>
                  )
                } else if (shape === 'circle') {
                  overlay = (
                    <div className="w-full h-full rounded-full" style={{ boxShadow: `0 0 0 3px ${p.color} inset` }}></div>
                  )
                } else if (shape === 'ellipse') {
                  overlay = (
                    <div className="w-full h-full rounded-full" style={{ boxShadow: `0 0 0 3px ${p.color} inset` }}></div>
                  )
                } else if (shape === 'diamond') {
                  overlay = (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <polygon points="50,5 95,50 50,95 5,50" fill="transparent" stroke={p.color} strokeWidth={3} />
                    </svg>
                  )
                } else if (shape === 'hexagon') {
                  overlay = (
                    <svg viewBox="0 0 100 87" className="w-full h-full">
                      <polygon points="50,5 95,25 95,65 50,85 5,65 5,25" fill="transparent" stroke={p.color} strokeWidth={3} />
                    </svg>
                  )
                } else {
                  overlay = box
                }
                highlightEl = (
                  <div key={`hl-${p.clientId}`} className="absolute z-30" style={{ left: x, top: y, width: w, height: h }}>
                    {overlay}
                  </div>
                )
              }
            }
          } else if (a && a.type === 'edge' && a.id) {
            highlightEl = null
          }
          return (
            <div key={`presence-${p.clientId}`}>{cursorEl}{highlightEl}</div>
          )
        })}
      </>
    )
  }, [participants, edges, toScreen])

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
    <div className="w-full h-full relative" onMouseMove={handleMouseMove}>
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
        onNodeContextMenu={onNodeContextMenu}
        onEdgeClick={onEdgeClick}
        onEdgeContextMenu={onEdgeContextMenu}
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

      {/* Context Menu for nodes */}
      {contextMenuNode && contextMenuPosition && !readOnly && (
        <DropdownMenu
          open={!!contextMenuNode}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setContextMenuNode(null)
              setContextMenuPosition(null)
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <div style={{ position: 'fixed', left: contextMenuPosition.x, top: contextMenuPosition.y, width: 0, height: 0 }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" forceMount align="start" side="bottom">
            <DropdownMenuItem onClick={handleContextAddChild}>
              <Plus className="mr-2 h-4 w-4" />
              Add Child Node
              <DropdownMenuShortcut>Tab</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleContextAddSibling}>
              <GitBranch className="mr-2 h-4 w-4" />
              Add Sibling Node
              <DropdownMenuShortcut>Enter</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Plus className="mr-2 h-4 w-4" />
                Add Node with Shape
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-48">
                <DropdownMenuItem onClick={() => handleContextAddNodeWithShape('rectangle')}>
                  <Square className="mr-2 h-4 w-4" />
                  Rectangle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleContextAddNodeWithShape('circle')}>
                  <Circle className="mr-2 h-4 w-4" />
                  Circle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleContextAddNodeWithShape('diamond')}>
                  <Diamond className="mr-2 h-4 w-4" />
                  Diamond
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleContextAddNodeWithShape('hexagon')}>
                  <Hexagon className="mr-2 h-4 w-4" />
                  Hexagon
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleContextAddNodeWithShape('roundedRectangle')}>
                  <Square className="mr-2 h-4 w-4" />
                  Rounded Rectangle
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleContextEdit}>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Label
              <DropdownMenuShortcut>Double-click</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleContextDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Node
              <DropdownMenuShortcut>Delete</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Context Menu for edges/connections */}
      {contextMenuEdge && contextMenuPosition && !readOnly && (
        <DropdownMenu
          open={!!contextMenuEdge}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setContextMenuEdge(null)
              setContextMenuPosition(null)
            }
          }}
        >
          <DropdownMenuTrigger asChild>
            <div style={{ position: 'fixed', left: contextMenuPosition.x, top: contextMenuPosition.y, width: 0, height: 0 }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" forceMount align="start" side="bottom">
            <DropdownMenuItem onClick={handleContextDeleteEdge} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Connection
              <DropdownMenuShortcut>Delete</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

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
      {!hidePresence && renderPresence}

      {/* Link Preview Modal for view mode */}
      {linkPreview && (
        <LinkPreviewModal
          isOpen={linkPreview.isOpen}
          onClose={() => setLinkPreview(null)}
          url={linkPreview.url}
          nodeLabel={linkPreview.nodeLabel}
          position={linkPreview.position}
        />
      )}
    </div>
  )
}
