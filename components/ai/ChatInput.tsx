"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles } from "lucide-react"
import type { ChatMode } from "./ModeToggle"

export default function ChatInput({ onSend, mode, disabled = false }: { onSend: (text: string) => void; mode: ChatMode; disabled?: boolean }) {
  const [value, setValue] = useState("")

  const handleSend = () => {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue("")
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <Textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Nhập yêu cầu cho AI mindmap" className="min-h-[92px] resize-none" disabled={disabled} />
      </div>
      <div className="flex flex-col gap-2">
        <Button onClick={handleSend} disabled={disabled || !value.trim()} className="gap-2">
          <Send className="h-4 w-4" />
          Gửi
        </Button>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {mode === "max" ? "Max" : "Normal"}
        </div>
      </div>
    </div>
  )
}

