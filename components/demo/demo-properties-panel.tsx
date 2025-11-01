"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface DemoPropertiesPanelProps {
  selectedNode: any
  onClose: () => void
  onUpdateNode: (nodeId: string, data: any) => void
}

export default function DemoPropertiesPanel({
  selectedNode,
  onClose,
  onUpdateNode,
}: DemoPropertiesPanelProps) {
  if (!selectedNode) return null

  const handleLabelChange = (value: string) => {
    onUpdateNode(selectedNode.id, { label: value })
  }

  const handleDescriptionChange = (value: string) => {
    onUpdateNode(selectedNode.id, { description: value })
  }

  const handleColorChange = (value: string) => {
    onUpdateNode(selectedNode.id, { color: value })
  }

  const handleShapeChange = (shape: string) => {
    onUpdateNode(selectedNode.id, { shape })
  }

  const shapes = [
    { value: "rectangle", label: "Rectangle", icon: "▭" },
    { value: "circle", label: "Circle", icon: "●" },
    { value: "ellipse", label: "Ellipse", icon: "⬭" },
    { value: "diamond", label: "Diamond", icon: "◆" },
    { value: "hexagon", label: "Hexagon", icon: "⬡" },
    { value: "roundedRectangle", label: "Rounded", icon: "▢" },
  ]

  return (
    <div className="absolute top-4 right-4 w-80 bg-background border rounded-lg shadow-lg z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background">
        <h3 className="font-semibold">Node Properties</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="node-label">Label</Label>
          <Input
            id="node-label"
            value={selectedNode.data.label || ""}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Enter node label"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="node-description">Description</Label>
          <Textarea
            id="node-description"
            value={selectedNode.data.description || ""}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Enter node description"
            rows={3}
          />
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="node-color">Color</Label>
          <div className="flex gap-2 flex-wrap">
            {["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#ef4444", "#14b8a6"].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: color,
                  borderColor: selectedNode.data.color === color ? "#000" : "transparent",
                }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>
        </div>

        <div className="pt-2 text-xs text-muted-foreground border-t">
          <p>Node ID: {selectedNode.id}</p>
          <p>Type: {selectedNode.type || "default"}</p>
          <p>Shape: {selectedNode.data.shape || "rectangle"}</p>
        </div>
      </div>
    </div>
  )
}

