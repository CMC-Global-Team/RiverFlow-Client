"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Sparkles, Gauge } from "lucide-react"

export type ChatMode = "max" | "normal"

export default function ModeToggle({ value, onChange }: { value: ChatMode; onChange: (v: ChatMode) => void }) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v as ChatMode)} variant="outline" size="sm">
      <ToggleGroupItem value="normal" aria-label="Normal Mode" className="px-3">
        <Gauge className="h-4 w-4 mr-2" />
        Normal
      </ToggleGroupItem>
      <ToggleGroupItem value="max" aria-label="Max Mode" className="px-3">
        <Sparkles className="h-4 w-4 mr-2" />
        MAX MODE
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

