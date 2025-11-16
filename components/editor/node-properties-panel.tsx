"use client"

import {
  X, Trash2, Bold, Italic, Underline,
  Highlighter, Palette
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import { toast } from "sonner"
import { useState, useRef, useEffect } from "react"

export default function NodePropertiesPanel() {
  const { selectedNode, updateNodeData, setSelectedNode, deleteNode } = useMindmapContext()

  const [focusedField, setFocusedField] = useState<"label" | "description" | null>(null)

  const labelRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)

  const [showHighlight, setShowHighlight] = useState(false)
  const [showTextColor, setShowTextColor] = useState(false)

  const COLORS = [
    "#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6",
    "#8b5cf6", "#ec4899", "#14b8a6", "#000000", "#ffffff"
  ]

  if (!selectedNode) return null

  
  useEffect(() => {
    if (labelRef.current) labelRef.current.innerHTML = selectedNode.data.label || ""
    if (descRef.current) descRef.current.innerHTML = selectedNode.data.description || ""
  }, [selectedNode.id])

  
  const saveField = (field: "label" | "description") => {
    const ref = field === "label" ? labelRef.current : descRef.current
    if (!ref) return
    updateNodeData(selectedNode.id, { [field]: ref.innerHTML })
  }

 
  const format = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    if (focusedField) saveField(focusedField)
  }

  const toggleBold = () => format("bold")
  const toggleItalic = () => format("italic")
  const toggleUnderline = () => format("underline")

  const applyStyle = (type: "highlight" | "color", color: string) => {
    format(type === "highlight" ? "hiliteColor" : "foreColor", color)
  }

  
  useEffect(() => {
    const close = () => {
      setShowHighlight(false)
      setShowTextColor(false)
    }
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [])

  
  const handleShape = (shape: string) =>
    updateNodeData(selectedNode.id, { shape })

  const handleColor = (color: string) =>
    updateNodeData(selectedNode.id, { color })

  const handleBg = (bgColor?: string) =>
    updateNodeData(selectedNode.id, { bgColor })

  const shapes = [
    { value: "rectangle", label: "Rectangle", icon: "▭" },
    { value: "circle", label: "Circle", icon: "●" },
    { value: "ellipse", label: "Ellipse", icon: "⬭" },
    { value: "diamond", label: "Diamond", icon: "◆" },
    { value: "hexagon", label: "Hexagon", icon: "⬡" },
    { value: "roundedRectangle", label: "Rounded", icon: "▢" }
  ]

  const bgColors = [
    "#ffffff", "#f3f4f6", "#e5e7eb",
    "#dbeafe", "#fde8e8", "#fef3c7", "#d1fae5", "#e0e7ff",
    "#f3e8ff", "#fee2e2", "#fef9c3", "#d4f4dd"
  ]

  
  const remove = () => {
    deleteNode(selectedNode.id)
    toast.success("Node deleted")
  }

  return (
    <div className="h-full bg-card overflow-y-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card">
        <h3 className="font-semibold">Node Properties</h3>
        <Button variant="ghost" size="icon" onClick={() => setSelectedNode(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">

        {/* TOOLBAR */}
        <div className="flex gap-2 mb-2 flex-wrap">
          <Button variant="ghost" size="icon" onClick={toggleBold}><Bold /></Button>
          <Button variant="ghost" size="icon" onClick={toggleItalic}><Italic /></Button>
          <Button variant="ghost" size="icon" onClick={toggleUnderline}><Underline /></Button>

          {/* Highlight */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="icon" onClick={() => setShowHighlight(!showHighlight)}>
              <Highlighter />
            </Button>

            {showHighlight && (
              <div className="absolute bg-white border p-2 rounded shadow grid grid-cols-5 gap-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: c }}
                    onClick={() => applyStyle("highlight", c)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Text Color */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="icon" onClick={() => setShowTextColor(!showTextColor)}>
              <Palette />
            </Button>

            {showTextColor && (
              <div className="absolute bg-white border p-2 rounded shadow grid grid-cols-5 gap-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: c }}
                    onClick={() => applyStyle("color", c)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LABEL */}
        <Label>Label</Label>
        <div
          ref={labelRef}
          contentEditable
          suppressContentEditableWarning
          className="border rounded p-2 min-h-[30px] bg-white"
          onFocus={() => setFocusedField("label")}
          onInput={() => saveField("label")}
          onBlur={() => saveField("label")}
        />

        {/* DESCRIPTION */}
        <Label>Description</Label>
        <div
          ref={descRef}
          contentEditable
          suppressContentEditableWarning
          className="border rounded p-2 min-h-[60px] bg-white"
          onFocus={() => setFocusedField("description")}
          onInput={() => saveField("description")}
          onBlur={() => saveField("description")}
        />

        {/* SHAPE */}
        <div className="space-y-2">
          <Label>Shape</Label>
          <div className="grid grid-cols-3 gap-2">
            {shapes.map(s => (
              <button
                key={s.value}
                onClick={() => handleShape(s.value)}
                className={`p-3 border rounded-lg hover:bg-muted transition flex flex-col items-center gap-1 ${
                  selectedNode.data.shape === s.value ? "border-primary bg-primary/10" : ""
                }`}
              >
                <span className="text-2xl">{s.icon}</span>
                <span className="text-xs">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* COLOR */}
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2 flex-wrap">
            {["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#ef4444", "#14b8a6"].map(c => (
              <button
                key={c}
                onClick={() => handleColor(c)}
                className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: selectedNode.data.color === c ? "#000" : "transparent"
                }}
              />
            ))}
          </div>
        </div>

        {/* BACKGROUND */}
        <div className="space-y-2">
          <Label>Background</Label>
          <div className="flex gap-2 flex-wrap">
            {bgColors.map(c => (
              <button
                key={c}
                onClick={() => handleBg(c)}
                className="w-8 h-8 rounded-lg border-2 hover:scale-110 transition-transform relative"
                style={{
                  backgroundColor: c,
                  borderColor: selectedNode.data.bgColor === c ? "#000" : "#e5e7eb"
                }}
              >
                {selectedNode.data.bgColor === c && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-black rounded-full"></div>
                  </div>
                )}
              </button>
            ))}

            <button
              onClick={() => handleBg(undefined)}
              className="w-8 h-8 rounded-lg border-2 border-dashed flex items-center justify-center"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* INFO */}
        <div className="pt-2 text-xs text-muted-foreground border-t">
          <p>Node ID: {selectedNode.id}</p>
          <p>Type: {selectedNode.type}</p>
          <p>Shape: {selectedNode.data.shape}</p>
        </div>

        {/* DELETE */}
        <Button variant="destructive" className="w-full" onClick={remove}>
          <Trash2 className="mr-2" /> Delete Node
        </Button>

      </div>

    </div>
  )
}
