"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

export default function PropertiesPanel() {
  const [expandedSections, setExpandedSections] = useState({
    fill: true,
    stroke: true,
    text: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
    <div className="w-64 border-l border-border bg-card overflow-y-auto">
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-foreground">Properties</h3>

        {/* Fill Section */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection("fill")}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Fill</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.fill ? "" : "-rotate-90"}`} />
          </button>
          {expandedSections.fill && (
            <div className="px-4 py-3 border-t border-border space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Color</label>
                <div className="mt-2 flex gap-2">
                  <input type="color" defaultValue="#3b82f6" className="h-8 w-12 rounded cursor-pointer" />
                  <input
                    type="text"
                    defaultValue="#3b82f6"
                    className="flex-1 rounded border border-border bg-input px-2 py-1 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Opacity</label>
                <input type="range" min="0" max="100" defaultValue="100" className="w-full mt-2" />
              </div>
            </div>
          )}
        </div>

        {/* Stroke Section */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection("stroke")}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Stroke</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.stroke ? "" : "-rotate-90"}`} />
          </button>
          {expandedSections.stroke && (
            <div className="px-4 py-3 border-t border-border space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Color</label>
                <div className="mt-2 flex gap-2">
                  <input type="color" defaultValue="#3b82f6" className="h-8 w-12 rounded cursor-pointer" />
                  <input
                    type="text"
                    defaultValue="#3b82f6"
                    className="flex-1 rounded border border-border bg-input px-2 py-1 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Width</label>
                <input type="range" min="1" max="10" defaultValue="2" className="w-full mt-2" />
              </div>
            </div>
          )}
        </div>

        {/* Text Section */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection("text")}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Text</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${expandedSections.text ? "" : "-rotate-90"}`} />
          </button>
          {expandedSections.text && (
            <div className="px-4 py-3 border-t border-border space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Font Size</label>
                <input
                  type="number"
                  defaultValue="14"
                  className="w-full mt-2 rounded border border-border bg-input px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Font Weight</label>
                <select className="w-full mt-2 rounded border border-border bg-input px-2 py-1 text-xs">
                  <option>Normal</option>
                  <option>Bold</option>
                  <option>Italic</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
