"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

interface EdgePropertiesPanelProps {
  selectedEdge: any
  onClose: () => void
  onUpdateEdge: (edgeId: string, updates: any) => void
}

export default function EdgePropertiesPanel({
  selectedEdge,
  onClose,
  onUpdateEdge,
}: EdgePropertiesPanelProps) {
  if (!selectedEdge) return null

  const edgeTypes = [
    { value: "default", label: "Default", description: "Straight line" },
    { value: "straight", label: "Straight", description: "Direct connection" },
    { value: "smoothstep", label: "Smooth Step", description: "Rounded corners" },
    { value: "step", label: "Step", description: "90° angles" },
    { value: "bezier", label: "Bezier", description: "Curved line" },
  ]

  const handleLabelChange = (label: string) => {
    const updates: any = { label }
    
    // If adding label for first time, set default styles
    if (label && !selectedEdge.label) {
      updates.labelStyle = { fill: '#000000', fontWeight: 500, fontSize: 12 }
      updates.labelBgStyle = { fill: '#ffffff', fillOpacity: 0.9 }
      updates.labelBgPadding = [8, 4] as [number, number]
      updates.labelBgBorderRadius = 4
      updates.labelShowBg = true
    }
    
    onUpdateEdge(selectedEdge.id, updates)
  }

  const handleLabelTextColorChange = (color: string) => {
    onUpdateEdge(selectedEdge.id, {
      labelStyle: { 
        ...selectedEdge.labelStyle,
        fill: color,
        fontWeight: 500,
        fontSize: 12,
      }
    })
  }

  const handleLabelBgColorChange = (color: string) => {
    onUpdateEdge(selectedEdge.id, {
      labelBgStyle: { 
        fill: color,
        fillOpacity: 0.9,
      },
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4,
    })
  }

  const handleLabelPositionChange = (position: string) => {
    onUpdateEdge(selectedEdge.id, {
      labelShowBg: true,
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4,
      ...(position === 'center' ? {} : { labelPosition: position as any }),
    })
  }

  const handleTypeChange = (type: string) => {
    onUpdateEdge(selectedEdge.id, { type })
  }

  const handleAnimatedToggle = (animated: boolean) => {
    onUpdateEdge(selectedEdge.id, { animated })
  }

  const handleColorChange = (color: string) => {
    onUpdateEdge(selectedEdge.id, { 
      style: { ...selectedEdge.style, stroke: color },
      markerEnd: {
        ...selectedEdge.markerEnd,
        color: color,
      }
    })
  }

  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#ef4444", "#14b8a6"]

  return (
    <div className="absolute top-4 right-4 w-80 bg-background border rounded-lg shadow-lg z-10 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-background">
        <h3 className="font-semibold">Connection Properties</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edge-label">Connection Label</Label>
          <Input
            id="edge-label"
            value={selectedEdge.label || ""}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Add label to connection"
          />
        </div>

        {selectedEdge.label && (
          <>
            <div className="space-y-2">
              <Label>Label Position</Label>
              <div className="grid grid-cols-3 gap-2">
                {['start', 'center', 'end'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => handleLabelPositionChange(pos)}
                    className={`p-2 border rounded-lg text-xs capitalize transition-all hover:bg-muted ${
                      (pos === 'center' && !selectedEdge.labelPosition) || selectedEdge.labelPosition === pos
                        ? "border-primary bg-primary/10"
                        : ""
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Label Text Color</Label>
              <div className="flex gap-2 flex-wrap">
                {["#000000", "#ffffff", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedEdge.labelStyle?.fill === color ? "#000" : "transparent",
                    }}
                    onClick={() => handleLabelTextColorChange(color)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Label Background Color</Label>
              <div className="flex gap-2 flex-wrap">
                {["#ffffff", "#f3f4f6", "#000000", "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"].map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedEdge.labelBgStyle?.fill === color ? "#000" : "transparent",
                    }}
                    onClick={() => handleLabelBgColorChange(color)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label>Connection Style</Label>
          <div className="space-y-2">
            {edgeTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleTypeChange(type.value)}
                className={`w-full p-3 border rounded-lg text-left transition-all hover:bg-muted ${
                  selectedEdge.type === type.value ? "border-primary bg-primary/10" : ""
                }`}
              >
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-muted-foreground">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Line Color</Label>
          <div className="flex gap-2 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: color,
                  borderColor: selectedEdge.style?.stroke === color ? "#000" : "transparent",
                }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="animated">Animated</Label>
          <Switch
            id="animated"
            checked={selectedEdge.animated || false}
            onCheckedChange={handleAnimatedToggle}
          />
        </div>

        <div className="pt-2 text-xs text-muted-foreground border-t">
          <p>Connection ID: {selectedEdge.id}</p>
          <p>From: {selectedEdge.source}</p>
          <p>To: {selectedEdge.target}</p>
          <p>Type: {selectedEdge.type || "default"}</p>
          {selectedEdge.label && <p>Label: {selectedEdge.label}</p>}
        </div>
      </div>
    </div>
  )
}

