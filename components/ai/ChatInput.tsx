"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import type { ChatMode } from "./ModeToggle"
import ModeToggle from "./ModeToggle"
import FileUploader from "./FileUploader"

export default function ChatInput({ onSend, mode, onModeChange, onFilesSelected, disabled = false }: { onSend: (text: string) => void; mode: ChatMode; onModeChange: (m: ChatMode) => void; onFilesSelected: (files: File[]) => void; disabled?: boolean }) {
  const [value, setValue] = useState("")

  const handleSend = () => {
    if (!value.trim() || disabled) return
    onSend(value.trim())
    setValue("")
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <ModeToggle value={mode} onChange={onModeChange} />
        <FileUploader onFilesSelected={onFilesSelected} disabled={disabled} />
      </div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <Textarea value={value} onChange={(e) => setValue(e.target.value)} placeholder="Nhập yêu cầu cho AI mindmap" className="min-h-[110px] resize-none" disabled={disabled} />
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={handleSend} disabled={disabled || !value.trim()} className="gap-2">
            <Send className="h-4 w-4" />
            Gửi
          </Button>
        </div>
      </div>
    </div>
  )
}
