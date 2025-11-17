"use client"
import { useState, useEffect, useRef } from "react"
import { useMindmapContext } from '@/contexts/mindmap/MindmapContext'
import { memo } from "react"
import { Handle, Position, NodeProps } from "reactflow"

interface NodeData {
  label: string
  description?: string
  color?: string
  textColor?: string
  bgColor?: string
  shape?: string
  isEditing?: boolean
}

const EditableContent = memo(({ data, id }: { data: NodeData; id: string }) => {
  const { updateNodeData } = useMindmapContext()
  const [editingLabel, setEditingLabel] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)

  const [label, setLabel] = useState(data.label)
  const [description, setDescription] = useState(data.description)

  const labelRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (data.isEditing) {
      setEditingLabel(true)
      updateNodeData(id, { isEditing: false })
    }
  }, [data.isEditing, id, updateNodeData])

  useEffect(() => {
    if (editingLabel && labelRef.current) {
      labelRef.current.focus()
      const range = document.createRange()
      range.selectNodeContents(labelRef.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [editingLabel])

  useEffect(() => {
    if (editingDesc && descRef.current) {
      descRef.current.focus()
      const range = document.createRange()
      range.selectNodeContents(descRef.current)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [editingDesc])

  const finishLabel = () => {
    updateNodeData(id, { label })
    setEditingLabel(false)
  }

  const finishDesc = () => {
    updateNodeData(id, { description })
    setEditingDesc(false)
  }

  return (
    <div className="space-y-1">
      {editingLabel ? (
        <div
          ref={labelRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full outline-none font-semibold text-sm bg-transparent border-b border-primary px-1 -mx-1 rounded"
          onInput={(e) => setLabel(e.currentTarget.innerHTML)}
          onBlur={finishLabel}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.preventDefault()
              finishLabel()
            }
          }}
          dangerouslySetInnerHTML={{ __html: label || '' }}
        />
      ) : (
        <div
          className="font-semibold text-sm cursor-text select-none hover:bg-muted/50 px-1 -mx-1 rounded"
          style={{ color: data.textColor || "#ffffff" }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setEditingLabel(true)
          }}
          dangerouslySetInnerHTML={{ __html: data.label || '<span class="text-muted-foreground">Click to add title</span>' }}
        />
      )}

      {editingDesc ? (
        <div
          ref={descRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full outline-none text-xs text-muted-foreground bg-transparent border border-primary/30 rounded p-1 min-h-6"
          onInput={(e) => setDescription(e.currentTarget.innerHTML)}
          onBlur={finishDesc}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              finishDesc()
            }
          }}
          dangerouslySetInnerHTML={{ __html: description || '' }}
        />
      ) : (
        <div
          className="text-xs text-muted-foreground cursor-text select-none hover:bg-muted/50 px-1 -mx-1 rounded min-h-6"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setEditingDesc(true) }}
          dangerouslySetInnerHTML={{ __html: data.description || '<span class="text-muted-foreground/50">Description</span>' }}
        />
      )}
    </div>
  )
})
EditableContent.displayName = 'EditableContent';

// Base Node component to avoid repetition
const BaseNode = memo(({ data, selected, id, children, className }: NodeProps<NodeData> & { children: React.ReactNode, className?: string }) => {
  const color = data.color || "#3b82f6";

  return (
    <div
      className={`${className} ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`}
      style={{
        backgroundColor: color,
        borderColor: color
      }}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-300" />
      <Handle type="target" position={Position.Right} className="w-2 h-2 !bg-slate-300" />
      <Handle type="target" position={Position.Bottom} className="w-2 h-2 !bg-slate-300" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-slate-300" />
      {children}
      <EditableContent data={data} id={id} />
      <Handle type="source" position={Position.Top} className="w-2 h-2 !bg-slate-300" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-slate-300" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-slate-300" />
      <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-slate-300" />
    </div>
  );
});
BaseNode.displayName = 'BaseNode';

export const RectangleNode = (props: NodeProps<NodeData>) => (
  <BaseNode {...props} className="px-4 py-3 rounded-lg border-2 bg-background shadow-md transition-all min-w-[150px]">
    <div/>
  </BaseNode>
);
RectangleNode.displayName = "RectangleNode";

export const CircleNode = (props: NodeProps<NodeData>) => (
  <BaseNode {...props} className="rounded-full border-2 bg-background shadow-md transition-all w-32 h-32 flex items-center justify-center text-center px-3">
    <div/>
  </BaseNode>
);
CircleNode.displayName = "CircleNode";

export const DiamondNode = memo(({ data, selected, id }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6";
  return (
    <div className={`relative w-32 h-32 ${selected ? "z-10" : ""}`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-300 !top-[-6px]" />
      <Handle type="target" position={Position.Right} className="w-2 h-2 !bg-slate-300 !right-[-6px]" />
      <Handle type="target" position={Position.Bottom} className="w-2 h-2 !bg-slate-300 !bottom-[-6px]" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-slate-300 !left-[-6px]" />
      <div
        className={`absolute inset-0 rotate-45 border-2 bg-background shadow-md transition-all ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`}
        style={{ backgroundColor: color, borderColor: color }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-3 max-w-[80px]">
          <EditableContent data={data} id={id} />
        </div>
      </div>
      <Handle type="source" position={Position.Top} className="w-2 h-2 !bg-slate-300 !top-[-6px]" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-slate-300 !right-[-6px]" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-slate-300 !bottom-[-6px]" />
      <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-slate-300 !left-[-6px]" />
    </div>
  );
});
DiamondNode.displayName = "DiamondNode";

export const HexagonNode = memo(({ data, selected, id }: NodeProps<NodeData>) => {
  const color = data.color || "#3b82f6";
  return (
    <div className="relative w-36 h-[138px]">
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-slate-300 !top-[-2px]" />
      <Handle type="target" position={Position.Right} className="w-2 h-2 !bg-slate-300 !right-[-2px]" />
      <Handle type="target" position={Position.Bottom} className="w-2 h-2 !bg-slate-300 !bottom-[-2px]" />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-slate-300 !left-[-2px]" />
      <svg
        viewBox="0 0 100 87"
        className={`w-full h-full transition-all ${selected ? "drop-shadow-lg" : ""}`}
      >
        <polygon
          points="50,0 100,25 100,75 50,100 0,75 0,25"
          fill={color}
          stroke={color}
          strokeWidth="4"
          className={`${selected ? "stroke-blue-500" : ""}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <EditableContent data={data} id={id} />
        </div>
      </div>
      <Handle type="source" position={Position.Top} className="w-2 h-2 !bg-slate-300 !top-[-2px]" />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-slate-300 !right-[-2px]" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-slate-300 !bottom-[-2px]" />
      <Handle type="source" position={Position.Left} className="w-2 h-2 !bg-slate-300 !left-[-2px]" />
    </div>
  );
});
HexagonNode.displayName = "HexagonNode";

export const EllipseNode = (props: NodeProps<NodeData>) => (
  <BaseNode {...props} className="rounded-full border-2 bg-background shadow-md transition-all w-40 h-24 flex items-center justify-center text-center px-4">
    <div/>
  </BaseNode>
);
EllipseNode.displayName = "EllipseNode";

export const RoundedRectangleNode = (props: NodeProps<NodeData>) => (
  <BaseNode {...props} className="px-6 py-4 rounded-3xl border-2 bg-background shadow-md transition-all min-w-[150px]">
    <div/>
  </BaseNode>
);
RoundedRectangleNode.displayName = "RoundedRectangleNode";