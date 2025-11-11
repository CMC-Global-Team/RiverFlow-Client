"use client"

import { X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
const handleUpdateContent = (field: "label" | "description") => {
    const ref = field === "label" ? labelRef.current : descRef.current
    if (!ref) return
    const value = ref.innerHTML
    updateNodeData(selectedNode.id, { [field]: value })
  }
 const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (focusedField) handleUpdateContent(focusedField)
  }
const toggleBold = () => execCommand("bold")
  const toggleItalic = () => execCommand("italic")
  const toggleUnderline = () => execCommand("underline")
  const toggleTextStyle = (type: "highlight" | "color", value: string) => {
    if (type === "highlight") execCommand("hiliteColor", value)
    if (type === "color") execCommand("foreColor", value)
  }

    /*f FIX CHỮ BỊ NGƯỢC  */
  useEffect(() => {
    if (labelRef.current && labelRef.current.innerText !== selectedNode.data.label) {
      labelRef.current.innerHTML = selectedNode.data.label || ""
    }
    if (descRef.current && descRef.current.innerText !== selectedNode.data.description) {
      descRef.current.innerHTML = selectedNode.data.description || ""
    }
  }, [selectedNode.id])
  const handleLabelChange = (value: string) => {
    updateNodeData(selectedNode.id, { label: value })
  }

  const handleDescriptionChange = (value: string) => {
    updateNodeData(selectedNode.id, { description: value })
  }

  const handleColorChange = (value: string) => {
    updateNodeData(selectedNode.id, { color: value })
  }

  const handleBackgroundColorChange = (value: string) => {
    updateNodeData(selectedNode.id, { backgroundColor: value })
  }

  const handleShapeChange = (shape: string) => {
    updateNodeData(selectedNode.id, { shape })
  }

  const shapes = [
    { value: "rectangle", label: "Rectangle", icon: "▭" },
    { value: "circle", label: "Circle", icon: "●" },
    { value: "ellipse", label: "Ellipse", icon: "⬭" },
    { value: "diamond", label: "Diamond", icon: "◆" },
    { value: "hexagon", label: "Hexagon", icon: "⬡" },
    { value: "roundedRectangle", label: "Rounded", icon: "▢" },
  ]

  const handleDeleteNode = () => {
    deleteNode(selectedNode.id)
    toast.success('Node deleted')
  }

  const backgroundColors = [
    "#ffffff", "#f3f4f6", "#e5e7eb", // white, gray-100, gray-200
    "#dbeafe", "#fde8e8", "#fef3c7", "#d1fae5", "#e0e7ff", // light blue, red, yellow, green, indigo
    "#f3e8ff", "#fee2e2", "#fef9c3", "#d4f4dd", // light purple, red, yellow, green
  ]

  return (
  <div className="h-full bg-card overflow-y-auto">
    <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card">
      <h3 className="font-semibold">Node Properties</h3>
      <Button variant="ghost" size="icon" onClick={() => setSelectedNode(null)}>
        <X className="h-4 w-4" />
      </Button>
    </div>

    <div className="p-4 space-y-4">
      {/* --- TOOLBAR ĐỊNH DẠNG CHỮ --- */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <Button variant="ghost" size="icon" title="Bold" onClick={toggleBold}>
          <Bold className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" title="Italic" onClick={toggleItalic}>
          <Italic className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" title="Underline" onClick={toggleUnderline}>
          <Underline className="h-5 w-5" />
        </Button>

        {/* Highlight */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            title="Highlight"
            onClick={() => setShowHighlight(!showHighlight)}
          >
            <Highlighter className="h-5 w-5" />
          </Button>
          {showHighlight && (
            <div className="absolute mt-1 bg-white p-2 border rounded shadow z-20 max-w-fit grid grid-cols-4 gap-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    toggleTextStyle("highlight", color);
                    setShowHighlight(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Text Color */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            title="Text Color"
            onClick={() => setShowTextColor(!showTextColor)}
          >
            <Palette className="h-5 w-5" />
          </Button>
          {showTextColor && (
            <div className="absolute mt-1 bg-white p-2 border rounded shadow z-20 max-w-fit grid grid-cols-4 gap-1">
              {COLORS.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    toggleTextStyle("color", color);
                    setShowTextColor(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- LABEL --- */}
      <div
        ref={labelRef}
        contentEditable
        suppressContentEditableWarning
        className="border rounded p-2 min-h-[30px] focus:outline-none"
        style={{
          direction: "ltr",
          textAlign: "left",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        onFocus={() => setFocusedField("label")}
        onInput={() => handleUpdateContent("label")}
        onBlur={() => handleUpdateContent("label")}
      />

      {/* --- DESCRIPTION --- */}
      <div
        ref={descRef}
        contentEditable
        suppressContentEditableWarning
        className="border rounded p-2 min-h-[60px] focus:outline-none"
        style={{
          direction: "ltr",
          textAlign: "left",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        onFocus={() => setFocusedField("description")}
        onInput={() => handleUpdateContent("description")}
        onBlur={() => handleUpdateContent("description")}
      />

      {/* --- SHAPE --- */}
      <div className="space-y-2">
        <Label>Shape</Label>
        <div className="grid grid-cols-3 gap-2">
          {shapes.map((shape) => (
            <button
              key={shape.value}
              className={`p-3 border rounded-lg hover:bg-muted transition-colors flex flex-col items-center gap-1 ${
                selectedNode.data.shape === shape.value ? "border-primary bg-primary/10" : ""
              }`}
              onClick={() => handleShapeChange(shape.value)}
            >
              <span className="text-2xl">{shape.icon}</span>
              <span className="text-xs">{shape.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- COLOR --- */}
      <div className="space-y-2">
        <Label htmlFor="node-color">Color</Label>
        <div className="flex gap-2 flex-wrap">
          {["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#ef4444", "#14b8a6"].map(
            (color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: color,
                  borderColor: selectedNode.data.color === color ? "#000" : "transparent",
                }}
                onClick={() => handleColorChange(color)}
              />
            )
          )}
        </div>
      </div>

      {/* --- INFO --- */}
      <div className="pt-2 text-xs text-muted-foreground border-t">
        <p>Node ID: {selectedNode.id}</p>
        <p>Type: {selectedNode.type || "default"}</p>
        <p>Shape: {selectedNode.data.shape || "rectangle"}</p>
      </div>

      {/* --- DELETE --- */}
      <Button variant="destructive" className="w-full" onClick={handleDeleteNode}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Node
      </Button>
    </div>
  </div>
)
}
