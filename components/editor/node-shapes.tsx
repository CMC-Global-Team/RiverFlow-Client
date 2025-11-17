"use client"
import { useState, useEffect, useRef } from "react"
import { useMindmapContext } from '@/contexts/mindmap/MindmapContext'
import { memo } from "react"
import { Handle, Position, NodeProps } from "reactflow"

interface NodeData {
  label: string
  description?: string
  color?: string
  bgColor?: string
  shape?: string
  isEditing?: boolean
}
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

  // Handle click on container to enable editing when text has styles
  const handleContainerClick = (e: React.MouseEvent, isLabel: boolean) => {
    // Only trigger on direct click on the content area, not on nested elements
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('div') === e.currentTarget) {
      e.preventDefault()
      e.stopPropagation()
      if (isLabel) {
        setEditingLabel(true)
      } else {
        setEditingDesc(true)
      }
    }
  }

  return (
    <div ref={containerRef} className="space-y-1 w-full">
      {/* Label */}
      {editingLabel ? (
        <div
          ref={labelRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full outline-none font-semibold text-sm bg-transparent border-b-2 border-primary px-1 -mx-1 py-0.5 rounded transition-all"
          style={{ color: data.color || "#3b82f6" }}
          onBlur={finishLabel}
          onKeyDown={handleLabelKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="font-semibold text-sm cursor-text select-none hover:bg-primary/10 px-2 -mx-2 py-1 rounded transition-colors w-full"
          style={{ color: data.color || "#3b82f6", minHeight: '24px' }}
          onClick={(e) => handleContainerClick(e, true)}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          dangerouslySetInnerHTML={{ __html: data.label || '<span class="opacity-50">Click to edit</span>' }}
        />
      )}

      {/* Description */}
      {editingDesc ? (
        <div
          ref={descRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full outline-none text-xs bg-transparent border border-primary/30 rounded p-1 min-h-6 transition-all"
          style={{ color: data.color ? `${data.color}99` : "#6b7280" }}
          onBlur={finishDesc}
          onKeyDown={handleDescKeyDown}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="text-xs cursor-text select-none hover:bg-primary/10 px-2 -mx-2 py-1 rounded transition-colors min-h-8 w-full flex items-center"
          style={{ color: data.color ? `${data.color}99` : "#6b7280" }}
          onClick={(e) => handleContainerClick(e, false)}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          dangerouslySetInnerHTML={{ __html: data.description || '<span class="opacity-50">Click to add description</span>' }}
        />
      )}
    </div>
  )
})
// Rectangle Node (default)
export const RectangleNode = memo(({ data, selected, id }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 bg-background shadow-md transition-all min-w-[150px] cursor-pointer ${
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
        />      <div className="space-y-1 pointer-events-auto">
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
        />    </div>
  )
})

RectangleNode.displayName = "RectangleNode"

// Circle Node
export const CircleNode = memo(({ data, selected, id }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"

  return (
    <div
      className={`rounded-full border-2 bg-background shadow-md transition-all w-32 h-32 flex items-center justify-center cursor-pointer ${
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
        />    </div>
  )
})

CircleNode.displayName = "CircleNode"

// Diamond Node
export const DiamondNode = memo(({ data, selected, id }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"

  return (
    <div className="relative w-32 h-32">
        <Handle
            type="target"
            id="target-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%", top: "-21%"}}
        />
        <Handle
            type="target"
            id="target-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%", right: "-21%"}}
        />
        <Handle
            type="target"
            id="target-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%", bottom: "-21%"}}
        />
        <Handle
            type="target"
            id="target-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%", left: "-21%"}}
        />      <div
        className={`absolute inset-0 rotate-45 border-2 bg-background shadow-md transition-all cursor-pointer ${
          selected ? "ring-2 ring-primary ring-offset-2" : ""
        }`}
        style={{
          borderColor: color,
          backgroundColor: data.bgColor || "transparent"
         }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        <div className="text-center px-3 max-w-[80px]">
          <EditableContent data={data} id={id} />
        </div>
      </div>
        <Handle
            type="source"
            id="source-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%", top: "-21%" }}
        />
        <Handle
            type="source"
            id="source-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%", right: "-21%" }}
        />
        <Handle
            type="source"
            id="source-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%", bottom: "-21%" }}
        />
        <Handle
            type="source"
            id="source-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%", left: "-21%" }}
        />    </div>
  )
})

DiamondNode.displayName = "DiamondNode"

// Hexagon Node
export const HexagonNode = memo(({ data, selected, id }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"

  return (
    <div className="relative w-36 h-32">
        <Handle
            type="target"
            id="target-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%", top: "3%" }}
        />
        <Handle
            type="target"
            id="target-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%", right: "3%" }}
        />
        <Handle
            type="target"
            id="target-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%", bottom: "3%" }}
        />
        <Handle
            type="target"
            id="target-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%", left: "3%" }}
        />      <svg
        viewBox="0 0 100 87"
        className={`w-full h-full transition-all cursor-pointer ${selected ? "drop-shadow-lg" : ""}`}
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
        <Handle
            type="source"
            id="source-top"
            position={Position.Top}
            className="w-3 h-3"
            style={{ background: color, left: "50%", top: "3%" }}
        />
        <Handle
            type="source"
            id="source-right"
            position={Position.Right}
            className="w-3 h-3"
            style={{ background: color, top: "50%", right: "3%" }}
        />
        <Handle
            type="source"
            id="source-bottom"
            position={Position.Bottom}
            className="w-3 h-3"
            style={{ background: color, left: "50%", bottom: "3%" }}
        />
        <Handle
            type="source"
            id="source-left"
            position={Position.Left}
            className="w-3 h-3"
            style={{ background: color, top: "50%", left: "3%" }}
        />    </div>
  )
})

HexagonNode.displayName = "HexagonNode"

// Ellipse Node
export const EllipseNode = memo(({ data, selected, id }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"

  return (
    <div
      className={`rounded-full border-2 bg-background shadow-md transition-all w-40 h-24 flex items-center justify-center cursor-pointer ${
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
        />      <div className="text-center px-4 pointer-events-auto">
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
        />    </div>
  )
})

EllipseNode.displayName = "EllipseNode"

// Rounded Rectangle Node
export const RoundedRectangleNode = memo(({ data, selected, id }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6"

  return (
    <div
      className={`px-6 py-4 rounded-3xl border-2 bg-background shadow-md transition-all min-w-[150px] cursor-pointer ${
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
        />      <div className="space-y-1 pointer-events-auto">
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
        />    </div>
  )
})

RoundedRectangleNode.displayName = "RoundedRectangleNode"

