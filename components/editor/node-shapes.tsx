"use client"
import { useState, useEffect, useRef } from "react"
import { linkify } from '@/components/ui/linkify'
import { useMindmapContext } from '@/contexts/mindmap/MindmapContext'
import { memo } from "react"
import { Handle, Position, NodeProps, useReactFlow } from "reactflow"
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

interface NodeData {
  label: string
  description?: string
  color?: string
  bgColor?: string
  shape?: string
  isEditing?: boolean
  scale?: number
}

// Resize Handle Component
const ResizeHandle = memo(({ nodeId, currentScale, canEdit = true }: { nodeId: string; currentScale: number; canEdit?: boolean }) => {
  const { updateNodeData } = useMindmapContext()
  const { updateNodeInternals } = useReactFlow()
  const [isResizing, setIsResizing] = useState(false)
  const [hovering, setHovering] = useState(false)
  const startScaleRef = useRef(currentScale)
  const startPosRef = useRef({ x: 0, y: 0 })
  const centerRef = useRef<{ x: number; y: number } | null>(null)
  const startRadiusRef = useRef(0)

  if (!canEdit) {
    return null
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    startPosRef.current = { x: e.clientX, y: e.clientY }
    startScaleRef.current = currentScale
    const parent = (e.currentTarget as HTMLElement).parentElement
    if (parent) {
      const rect = parent.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      centerRef.current = { x: cx, y: cy }
      startRadiusRef.current = Math.hypot(e.clientX - cx, e.clientY - cy)
    } else {
      centerRef.current = null
      startRadiusRef.current = Math.hypot(0, 0)
    }
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      let delta: number
      if (centerRef.current) {
        const r0 = startRadiusRef.current
        const r1 = Math.hypot(e.clientX - centerRef.current.x, e.clientY - centerRef.current.y)
        delta = (r1 - r0) / 200
      } else {
        const deltaX = e.clientX - startPosRef.current.x
        const deltaY = e.clientY - startPosRef.current.y
        delta = (Math.hypot(deltaX, deltaY)) / 200 * (deltaX + deltaY >= 0 ? 1 : -1)
      }
      
      let newScale = startScaleRef.current + delta
      newScale = Math.max(0.6, Math.min(2.0, newScale))
      
      updateNodeData(nodeId, { scale: Math.round(newScale * 10) / 10 })
      updateNodeInternals(nodeId)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, nodeId, currentScale, updateNodeData])

  const VISIBLE_SIZE = 12
  const HIT_AREA = 24
  const handleStyle = {
    width: `${VISIBLE_SIZE}px`,
    height: `${VISIBLE_SIZE}px`,
    background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
    borderRadius: '2px',
    boxShadow: '0 0 0 1px rgba(59,130,246,0.6)',
    opacity: hovering || isResizing ? 1 : 0,
    transition: 'opacity 0.12s',
    pointerEvents: 'auto' as const,
    padding: `${(HIT_AREA - VISIBLE_SIZE)/2}px`,
    margin: `-${(HIT_AREA - VISIBLE_SIZE)/2}px`,
  }

  return (
    <>
      <div
        className="absolute top-0 left-0"
        style={{...handleStyle, cursor: 'nwse-resize'}}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => !isResizing && setHovering(false)}
        title="Drag to resize"
      />
      <div
        className="absolute top-0 right-0"
        style={{...handleStyle, cursor: 'nesw-resize'}}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => !isResizing && setHovering(false)}
        title="Drag to resize"
      />
      <div
        className="absolute bottom-0 left-0"
        style={{...handleStyle, cursor: 'nesw-resize'}}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => !isResizing && setHovering(false)}
        title="Drag to resize"
      />
      <div
        className="absolute bottom-0 right-0"
        style={{...handleStyle, cursor: 'se-resize'}}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => !isResizing && setHovering(false)}
        title="Drag to resize"
      />
    </>
  )
})

ResizeHandle.displayName = "ResizeHandle"

const EditableContent = memo(({ data, id }: { data: NodeData; id: string }) => {
  const { updateNodeData } = useMindmapContext()
  const [editingLabel, setEditingLabel] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const labelRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const initialLabelHtml = useRef<string>('')
  const initialDescHtml = useRef<string>('')

  // Auto-enable editing when isEditing prop is set
  useEffect(() => {
    if (data.isEditing && !editingLabel) {
      setEditingLabel(true)
      updateNodeData(id, { isEditing: false })
    }
  }, [data.isEditing, editingLabel, id, updateNodeData])

  // Set up label edit mode - preserve HTML content
  useEffect(() => {
    if (editingLabel && labelRef.current) {
      initialLabelHtml.current = data.label || ""
      labelRef.current.innerHTML = initialLabelHtml.current
      labelRef.current.focus()
      // Select all text on focus
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(labelRef.current)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [editingLabel])

  // Set up description edit mode - preserve HTML content
  useEffect(() => {
    if (editingDesc && descRef.current) {
      initialDescHtml.current = data.description || ""
      descRef.current.innerHTML = initialDescHtml.current
      descRef.current.focus()
    }
  }, [editingDesc])

  const finishLabel = () => {
    if (labelRef.current) {
      const html = labelRef.current.innerHTML
      // Only update if changed to avoid unnecessary saves
      if (html !== initialLabelHtml.current) {
        updateNodeData(id, { label: html })
      }
    }
    setEditingLabel(false)
  }

  const finishDesc = () => {
    if (descRef.current) {
      const html = descRef.current.innerHTML
      // Only update if changed
      if (html !== initialDescHtml.current) {
        updateNodeData(id, { description: html })
      }
    }
    setEditingDesc(false)
  }

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setEditingLabel(false)
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault()
      finishLabel()
    }
  }

  const handleDescKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setEditingDesc(false)
    }
  }

  // Editing is toggled via Canvas (double-click) to respect readOnly; remove inline click-to-edit

  return (
    <div ref={containerRef} className="space-y-1 w-full pointer-events-auto">
      {/* Label */}
      {editingLabel ? (
        <div
          ref={labelRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full outline-none font-semibold text-sm bg-transparent border-b-2 border-primary px-1 -mx-1 py-0.5 rounded transition-all pointer-events-auto"
          style={{ color: data.color || "#3b82f6" }}
          onBlur={finishLabel}
          onKeyDown={handleLabelKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="font-semibold text-sm select-none px-2 -mx-2 py-1 rounded transition-colors w-full pointer-events-auto"
          style={{ color: data.color || "#3b82f6", minHeight: '24px' }}
          dangerouslySetInnerHTML={{ __html: linkify(data.label || '<span class="opacity-50">Click to edit</span>') }}
        />
      )}

      {editingDesc && (
        <div
          ref={descRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full outline-none text-xs bg-transparent border border-primary/30 rounded p-1 min-h-6 transition-all pointer-events-auto"
          style={{ color: data.color ? `${data.color}99` : "#6b7280" }}
          onBlur={finishDesc}
          onKeyDown={handleDescKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
        />
      )}
    </div>
  )
})
// Rectangle Node (default)
export const RectangleNode = memo(({ data, selected, id, isConnectable }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"
  const scale = data.scale || 1
  const { updateNodeInternals } = useReactFlow()

  useEffect(() => {
    updateNodeInternals(id)
  }, [scale, id, updateNodeInternals])

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        transition: 'transform 0.2s ease'
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`px-4 py-3 rounded-lg border-2 bg-background shadow-md transition-all min-w-[150px] cursor-pointer relative ${
              selected ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
            style={{
              borderColor: color,
              backgroundColor: data.bgColor || "transparent"
            }}
          >
          {isConnectable && (
            <>
              <Handle type="target" id="target-top" position={Position.Top} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
              <Handle type="target" id="target-right" position={Position.Right} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
              <Handle type="target" id="target-bottom" position={Position.Bottom} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
              <Handle type="target" id="target-left" position={Position.Left} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
            </>
          )}
          <div className="space-y-1 pointer-events-auto">
          <EditableContent data={data} id={id} />
          </div>
          {isConnectable && (
            <>
              <Handle type="source" id="source-top" position={Position.Top} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
              <Handle type="source" id="source-right" position={Position.Right} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
              <Handle type="source" id="source-bottom" position={Position.Bottom} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
              <Handle type="source" id="source-left" position={Position.Left} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
            </>
          )}
          <ResizeHandle nodeId={id} currentScale={scale} canEdit={!!isConnectable} />
          </div>
        </TooltipTrigger>
        {data.description && (
          <TooltipContent side="top" align="center" className="max-w-xs break-words">
            <div
              dangerouslySetInnerHTML={{ __html: linkify(data.description) }}
            />
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  )
})

RectangleNode.displayName = "RectangleNode"

// Circle Node
export const CircleNode = memo(({ data, selected, id, isConnectable }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"
  const scale = data.scale || 1
  const { updateNodeInternals } = useReactFlow()

  useEffect(() => {
    updateNodeInternals(id)
  }, [scale, id, updateNodeInternals])

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        transition: 'transform 0.2s ease'
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`rounded-full border-2 bg-background shadow-md transition-all w-32 h-32 flex items-center justify-center cursor-pointer relative ${
              selected ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
            style={{
              borderColor: color,
              backgroundColor: data.bgColor || "transparent"
            }}
          >
        <Handle
            type="target"
            id="target-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="target"
            id="target-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />
        <Handle
            type="target"
            id="target-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="target"
            id="target-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />      <div className="text-center px-3 pointer-events-auto">
        <EditableContent data={data} id={id} />
      </div>
        <Handle
            type="source"
            id="source-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="source"
            id="source-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />
        <Handle
            type="source"
            id="source-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%" }}
        />
        <Handle
            type="source"
            id="source-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%" }}
        />
        <ResizeHandle nodeId={id} currentScale={scale} />
          </div>
        </TooltipTrigger>
        {data.description && (
          <TooltipContent side="top" align="center" className="max-w-xs break-words">
            <div
              dangerouslySetInnerHTML={{ __html: linkify(data.description) }}
            />
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  )
})

CircleNode.displayName = "CircleNode"

// Diamond Node
export const DiamondNode = memo(({ data, selected, id, isConnectable }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"
  const scale = data.scale || 1
  const { updateNodeInternals } = useReactFlow()

  useEffect(() => {
    updateNodeInternals(id)
  }, [scale, id, updateNodeInternals])

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        transition: 'transform 0.2s ease'
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative w-32 h-32">
        {isConnectable && (
          <>
            <Handle type="target" id="target-top" position={Position.Top} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-right" position={Position.Right} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-bottom" position={Position.Bottom} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-left" position={Position.Left} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
          </>
        )}

        <svg viewBox="0 0 100 100" className={`w-full h-full transition-all ${selected ? "drop-shadow-lg" : ""}`}>
          <polygon
            points="50,5 95,50 50,95 5,50"
            fill={data.bgColor || "#ffffff"}
            stroke={color}
            strokeWidth="2"
            className={selected ? "stroke-[3]" : ""}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="text-center px-3 max-w-[80px]">
            <EditableContent data={data} id={id} />
          </div>
        </div>

        {isConnectable && (
          <>
            <Handle type="source" id="source-top" position={Position.Top} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-right" position={Position.Right} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-bottom" position={Position.Bottom} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-left" position={Position.Left} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
          </>
        )}
        <ResizeHandle nodeId={id} currentScale={scale} canEdit={!!isConnectable} />
          </div>
        </TooltipTrigger>
        {data.description && (
          <TooltipContent side="top" align="center" className="max-w-xs break-words">
            <div
              dangerouslySetInnerHTML={{ __html: linkify(data.description) }}
            />
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  )
})

DiamondNode.displayName = "DiamondNode"

// Hexagon Node
export const HexagonNode = memo(({ data, selected, id, isConnectable }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"
  const scale = data.scale || 1
  const { updateNodeInternals } = useReactFlow()

  useEffect(() => {
    updateNodeInternals(id)
  }, [scale, id, updateNodeInternals])

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        transition: 'transform 0.2s ease'
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative w-36 h-32">
        {isConnectable && (
          <>
            <Handle type="target" id="target-top" position={Position.Top} className="w-3 h-3" style={{ background: color, left: "50%", top: "3%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-right" position={Position.Right} className="w-3 h-3" style={{ background: color, top: "50%", right: "3%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-bottom" position={Position.Bottom} className="w-3 h-3" style={{ background: color, left: "50%", bottom: "3%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-left" position={Position.Left} className="w-3 h-3" style={{ background: color, top: "50%", left: "3%" }} isConnectable={isConnectable} />
          </>
        )}      <svg
        viewBox="0 0 100 87"
        className={`w-full h-full transition-all cursor-pointer relative ${selected ? "drop-shadow-lg" : ""}`}
      >
        <polygon
          points="50,5 95,25 95,65 50,85 5,65 5,25"
          fill={data.bgColor || "#ffffff"}
          stroke={color}
          strokeWidth="2"
          className={selected ? "stroke-[3]" : ""}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <div className="text-center px-4">
          <EditableContent data={data} id={id} />
        </div>
      </div>
        {isConnectable && (
          <>
            <Handle type="source" id="source-top" position={Position.Top} className="w-3 h-3" style={{ background: color, left: "50%", top: "3%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-right" position={Position.Right} className="w-3 h-3" style={{ background: color, top: "50%", right: "3%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-bottom" position={Position.Bottom} className="w-3 h-3" style={{ background: color, left: "50%", bottom: "3%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-left" position={Position.Left} className="w-3 h-3" style={{ background: color, top: "50%", left: "3%" }} isConnectable={isConnectable} />
          </>
        )}
        <ResizeHandle nodeId={id} currentScale={scale} canEdit={!!isConnectable} />
          </div>
        </TooltipTrigger>
        {data.description && (
          <TooltipContent side="top" align="center" className="max-w-xs break-words">
            <div
              dangerouslySetInnerHTML={{ __html: linkify(data.description) }}
            />
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  )
})

HexagonNode.displayName = "HexagonNode"

// Ellipse Node
export const EllipseNode = memo(({ data, selected, id, isConnectable }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"
  const scale = data.scale || 1
  const { updateNodeInternals } = useReactFlow()

  useEffect(() => {
    updateNodeInternals(id)
  }, [scale, id, updateNodeInternals])

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        transition: 'transform 0.2s ease'
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`rounded-full border-2 bg-background shadow-md transition-all w-40 h-24 flex items-center justify-center cursor-pointer relative ${
              selected ? "ring-2 ring-primary ring-offset-2" : ""
            }`}
          style={{
            borderColor: color,
            backgroundColor: data.bgColor || "transparent"
          }}
        >
        {isConnectable && (
          <>
            <Handle type="target" id="target-top" position={Position.Top} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-right" position={Position.Right} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-bottom" position={Position.Bottom} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-left" position={Position.Left} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
          </>
        )}      <div className="text-center px-4 pointer-events-auto">
        <EditableContent data={data} id={id} />
      </div>
        {isConnectable && (
          <>
            <Handle type="source" id="source-top" position={Position.Top} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-right" position={Position.Right} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-bottom" position={Position.Bottom} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-left" position={Position.Left} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
          </>
        )}
        <ResizeHandle nodeId={id} currentScale={scale} canEdit={!!isConnectable} />
          </div>
        </TooltipTrigger>
        {data.description && (
          <TooltipContent side="top" align="center" className="max-w-xs break-words">
            <div
              dangerouslySetInnerHTML={{ __html: linkify(data.description) }}
            />
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  )
})

EllipseNode.displayName = "EllipseNode"

// Rounded Rectangle Node
export const RoundedRectangleNode = memo(({ data, selected, id, isConnectable }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"
  const scale = data.scale || 1
  const { updateNodeInternals } = useReactFlow()

  useEffect(() => {
    updateNodeInternals(id)
  }, [scale, id, updateNodeInternals])

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        transition: 'transform 0.2s ease'
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`px-6 py-4 rounded-3xl border-2 bg-background shadow-md transition-all min-w-[150px] cursor-pointer relative ${
              selected ? "ring-2 ring-primary ring-offset-2" : ""
          }`}
          style={{
            borderColor: color,
            backgroundColor: data.bgColor || "transparent"
          }}
        >
        {isConnectable && (
          <>
            <Handle type="target" id="target-top" position={Position.Top} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-right" position={Position.Right} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-bottom" position={Position.Bottom} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="target" id="target-left" position={Position.Left} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
          </>
        )}      <div className="space-y-1 pointer-events-auto">
        <EditableContent data={data} id={id} />
      </div>
        {isConnectable && (
          <>
            <Handle type="source" id="source-top" position={Position.Top} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-right" position={Position.Right} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-bottom" position={Position.Bottom} className="w-3 h-3" style={{ background: color, left: "50%" }} isConnectable={isConnectable} />
            <Handle type="source" id="source-left" position={Position.Left} className="w-3 h-3" style={{ background: color, top: "50%" }} isConnectable={isConnectable} />
          </>
        )}
        <ResizeHandle nodeId={id} currentScale={scale} canEdit={!!isConnectable} />
          </div>
        </TooltipTrigger>
        {data.description && (
          <TooltipContent side="top" align="center" className="max-w-xs break-words">
            <div
              dangerouslySetInnerHTML={{ __html: linkify(data.description) }}
            />
          </TooltipContent>
        )}
      </Tooltip>
    </div>
  )
})

RoundedRectangleNode.displayName = "RoundedRectangleNode"

