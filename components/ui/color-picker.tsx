"use client"

import { HexColorPicker } from "react-colorful"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ColorPickerProps {
  color: string
  setColor: (color: string) => void
  children?: React.ReactNode
}

export function ColorPicker({ color, setColor, children }: ColorPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none">
        <HexColorPicker color={color} onChange={setColor} />
      </PopoverContent>
    </Popover>
  )
}

