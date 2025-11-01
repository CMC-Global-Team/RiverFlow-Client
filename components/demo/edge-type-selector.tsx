"use client"

import { Label } from "@/components/ui/label"

interface EdgeTypeSelectorProps {
  currentType: string
  onTypeChange: (type: string) => void
}

export default function EdgeTypeSelector({ currentType, onTypeChange }: EdgeTypeSelectorProps) {
  const edgeTypes = [
    { value: "default", label: "Default", description: "Straight line" },
    { value: "straight", label: "Straight", description: "Direct connection" },
    { value: "smoothstep", label: "Smooth Step", description: "Rounded corners" },
    { value: "step", label: "Step", description: "90° angles" },
    { value: "bezier", label: "Bezier", description: "Curved line" },
  ]

  return (
    <div className="absolute bottom-4 left-4 z-10 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg p-4 w-64">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Connection Style</Label>
        <div className="space-y-2">
          {edgeTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onTypeChange(type.value)}
              className={`w-full p-3 border rounded-lg text-left transition-all hover:bg-muted ${
                currentType === type.value ? "border-primary bg-primary/10" : ""
              }`}
            >
              <div className="font-medium text-sm">{type.label}</div>
              <div className="text-xs text-muted-foreground">{type.description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

