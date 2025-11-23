"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function ModeSelector({ value, onChange, normalCost, maxCost }: { value: 'normal' | 'max'; onChange: (v: 'normal' | 'max') => void; normalCost: number; maxCost: number }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Chế độ</div>
      <ToggleGroup type="single" value={value} onValueChange={(v) => onChange((v as 'normal' | 'max') || 'normal')} className="gap-2">
        <ToggleGroupItem value="normal" aria-label="Normal" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          Normal • {normalCost} credit
        </ToggleGroupItem>
        <ToggleGroupItem value="max" aria-label="Max" className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
          Max Mode • {maxCost} credit
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}

