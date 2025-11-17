"use client"

import { X, Trash2, Bold, Italic, Underline, Highlighter, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"

export default function EdgePropertiesPanel() {
  const { selectedEdge, updateEdgeData, setSelectedEdge, deleteEdge } = useMindmapContext()

  if (!selectedEdge) return null

  const [showHighlight, setShowHighlight] = useState(false)
  const [showTextColor, setShowTextColor] = useState(false)
  const highlightRef = useRef<HTMLDivElement>(null)
  const textColorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      
      if (highlightRef.current && !highlightRef.current.contains(target)) {
        if (!target.closest('.highlight-btn')) {
          setShowHighlight(false)
        }
      }
      
      if (textColorRef.current && !textColorRef.current.contains(target)) {
        if (!target.closest('.text-color-btn')) {
          setShowTextColor(false)
        }
      }
    }

    if (showHighlight || showTextColor) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showHighlight, showTextColor])

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
      updates.interactionWidth = 20
    }
    
    updateEdgeData(selectedEdge.id, updates)
  }

  const handleLabelTextColorChange = (color: string) => {
    updateEdgeData(selectedEdge.id, {
      labelStyle: { 
        ...selectedEdge.labelStyle,
        fill: color,
        fontWeight: 500,
        fontSize: 12,
      }
    })
  }

  const handleLabelBgColorChange = (color: string) => {
    updateEdgeData(selectedEdge.id, {
      labelBgStyle: { 
        fill: color,
        fillOpacity: 0.9,
      },
      labelBgPadding: [8, 4] as [number, number],
      labelBgBorderRadius: 4,
    })
  }

  const handleTypeChange = (type: string) => {
    updateEdgeData(selectedEdge.id, { 
      type,
      // Ensure label properties are preserved and label shows correctly on different edge types
      ...(selectedEdge.label && {
        labelShowBg: true,
        labelBgPadding: [8, 4] as [number, number],
        labelBgBorderRadius: 4,
        interactionWidth: 20,
      })
    })
  }

  const handleAnimatedToggle = (animated: boolean) => {
    updateEdgeData(selectedEdge.id, { animated })
  }

  const handleColorChange = (color: string) => {
    const currentStyle = selectedEdge.style || {}
    const currentMarkerEnd = selectedEdge.markerEnd || {}
    
    const updates: any = {
      style: { ...currentStyle, stroke: color },
      markerEnd: {
        ...currentMarkerEnd,
        color: color,
      }
    }
    
    updateEdgeData(selectedEdge.id, updates)
  }

  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#ef4444", "#14b8a6"]
  const swatches = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#000000", "#ffffff"]

  const toggleBold = () => {
    const current = selectedEdge.labelStyle?.fontWeight
    updateEdgeData(selectedEdge.id, { labelStyle: { ...selectedEdge.labelStyle, fontWeight: current === 700 || current === '700' || current === 'bold' ? 400 : 700 } })
  }

  const toggleItalic = () => {
    const current = selectedEdge.labelStyle?.fontStyle
    updateEdgeData(selectedEdge.id, { labelStyle: { ...selectedEdge.labelStyle, fontStyle: current === 'italic' ? 'normal' : 'italic' } })
  }

  const toggleUnderline = () => {
    const current = selectedEdge.labelStyle?.textDecoration
    const next = current === 'underline' ? 'none' : 'underline'
    updateEdgeData(selectedEdge.id, { labelStyle: { ...selectedEdge.labelStyle, textDecoration: next } })
  }

  const applyTextColor = (color: string) => {
    handleLabelTextColorChange(color)
    setShowTextColor(false)
  }

  const applyHighlight = (color: string) => {
    updateEdgeData(selectedEdge.id, {
      labelHighlightColor: color
    })
    setShowHighlight(false)
  }

  const handleDeleteConnection = () => {
    deleteEdge(selectedEdge.id)
    toast.success('Connection deleted')
  }

  return (
    <div className="h-full bg-transparent">
      <div className="space-y-4">
        {/* TEXT TOOLBAR */}
        <div className="flex gap-2 mb-2 flex-wrap">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleBold() }}>
            <Bold />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleItalic() }}>
            <Italic />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleUnderline() }}>
            <Underline />
          </Button>

          {/* Highlight */}
          <div className="highlight-container relative" onClick={(e) => e.stopPropagation()}>
            <Button 
              className="highlight-btn"
              variant="ghost" 
              size="icon" 
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowHighlight(!showHighlight)
                setShowTextColor(false)
              }}
            >
              <Highlighter />
            </Button>
            {showHighlight && (
              <div 
                ref={highlightRef}
                className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-950 border border-border rounded shadow-xl p-3 grid grid-cols-5 gap-2 z-50 w-48"
                onMouseDown={(e) => e.stopPropagation()}
                style={{ pointerEvents: 'auto' }}
              >
                {swatches.map(c => (
                  <button
                    key={c}
                    className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-all hover:shadow-md"
                    style={{ 
                      backgroundColor: c,
                      borderColor: 'rgba(0,0,0,0.3)',
                      cursor: 'pointer'
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      applyHighlight(c)
                    }}
                    title={c}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Text Color */}
          <div className="text-color-container relative" onClick={(e) => e.stopPropagation()}>
            <Button 
              className="text-color-btn"
              variant="ghost" 
              size="icon" 
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowTextColor(!showTextColor)
                setShowHighlight(false)
              }}
            >
              <Palette />
            </Button>
            {showTextColor && (
              <div 
                ref={textColorRef}
                className="absolute top-full left-0 mt-1 bg-white dark:bg-slate-950 border border-border rounded shadow-xl p-3 grid grid-cols-5 gap-2 z-50 w-48"
                onMouseDown={(e) => e.stopPropagation()}
                style={{ pointerEvents: 'auto' }}
              >
                {swatches.map(c => (
                  <button
                    key={c}
                    className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-all hover:shadow-md"
                    style={{ 
                      backgroundColor: c,
                      borderColor: 'rgba(0,0,0,0.3)',
                      cursor: 'pointer'
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      applyTextColor(c)
                    }}
                    title={c}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edge-label">Connection Label</Label>
          <Input
            id="edge-label"
            value={(selectedEdge.label as string) || ""}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Add label to connection"
          />
        </div>

        {selectedEdge.label && (
          <>
            <div className="space-y-2">
              <Label>Label Background</Label>
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

        {/* Delete Connection Button */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleDeleteConnection}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Connection
        </Button>
      </div>
    </div>
  )
}

