"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import ModeToggle, { type ChatMode } from "./ModeToggle"
import ChatMessage, { type ChatMessageData } from "./ChatMessage"
import ChatInput from "./ChatInput"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Sparkles, GripVertical } from "lucide-react"

export default function ChatPanel() {
  const [mode, setMode] = useState<ChatMode>("normal")
  const [messages, setMessages] = useState<ChatMessageData[]>([])
  const [pending, setPending] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 1100, h: 520 })
  const draggingRef = useRef(false)
  const resizingRef = useRef(false)
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const posStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const sizeStartRef = useRef<{ w: number; h: number }>({ w: 1100, h: 520 })

  useEffect(() => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280
    const vh = typeof window !== "undefined" ? window.innerHeight : 800
    const w = Math.min(vw - 120, size.w)
    const h = size.h
    const x = Math.max(24, Math.floor(vw / 2 - w / 2))
    const y = Math.max(24, vh - h - 80)
    setSize({ w, h })
    setPos({ x, y })
  }, [])

  const header = useMemo(() => {
    return (
      <div className="flex items-center justify-between">
        <div
          onPointerDown={(e) => {
            draggingRef.current = true
            dragStartRef.current = { x: e.clientX, y: e.clientY }
            posStartRef.current = { ...pos }
            window.addEventListener("pointermove", handleDrag)
            window.addEventListener("pointerup", stopDrag)
          }}
          className="inline-flex items-center gap-2 px-2 py-1 rounded-md border hover:bg-muted cursor-move select-none"
        >
          <GripVertical className="h-4 w-4" />
          <Badge variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Mindmap
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">Kéo để di chuyển • Góc dưới để thay đổi kích thước</div>
      </div>
    )
  }, [pos])

  const handleDrag = (e: PointerEvent) => {
    if (!draggingRef.current) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    const nx = Math.max(12, Math.min(vw - size.w - 12, posStartRef.current.x + dx))
    const ny = Math.max(12, Math.min(vh - size.h - 12, posStartRef.current.y + dy))
    setPos({ x: nx, y: ny })
  }
  const stopDrag = () => {
    draggingRef.current = false
    window.removeEventListener("pointermove", handleDrag)
    window.removeEventListener("pointerup", stopDrag)
  }

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    resizingRef.current = true
    sizeStartRef.current = { ...size }
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    window.addEventListener("pointermove", handleResize)
    window.addEventListener("pointerup", stopResize)
  }
  const handleResize = (e: PointerEvent) => {
    if (!resizingRef.current) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    const nw = Math.max(560, Math.min(vw - pos.x - 12, sizeStartRef.current.w + dx))
    const nh = Math.max(420, Math.min(vh - pos.y - 12, sizeStartRef.current.h + dy))
    setSize({ w: nw, h: nh })
  }
  const stopResize = () => {
    resizingRef.current = false
    window.removeEventListener("pointermove", handleResize)
    window.removeEventListener("pointerup", stopResize)
  }

  const handleSend = async (text: string) => {
    const userMsg: ChatMessageData = { id: `${Date.now()}-u`, role: "user", content: text, attachments: attachments.map((f) => ({ name: f.name })) }
    setMessages((m) => [...m, userMsg])
    setPending(true)
    setAttachments([])
    const reply = mode === "max"
      ? `Mình sẽ tạo mindmap chi tiết với cấp độ tối đa:\n• Xác định mục tiêu, phạm vi và yêu cầu\n• Sinh các nhánh chính, phụ và mối liên hệ\n• Gợi ý tài nguyên, checklist và lộ trình\n• Sẵn sàng chuyển sang Editor khi bạn duyệt`
      : `Mình sẽ phác thảo mindmap ở mức cơ bản và có thể chỉnh sửa thêm.`
    await new Promise((r) => setTimeout(r, 600))
    const aiMsg: ChatMessageData = { id: `${Date.now()}-a`, role: "assistant", content: reply, mode }
    setMessages((m) => [...m, aiMsg])
    setPending(false)
  }

  return (
    <div className="pointer-events-auto" style={{ position: "absolute", left: pos.x, top: pos.y, width: size.w, height: size.h }}>
      <Card className="h-full p-4 bg-background/85 backdrop-blur border shadow-lg flex flex-col">
        {header}
        <div className="mt-3 flex-1">
          <ScrollArea className="h-full pr-3">
            <div className="space-y-4">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {messages.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Nhập yêu cầu để AI thiết kế mindmap theo ý tưởng của bạn.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <div className="mt-3">
          <ChatInput onSend={handleSend} mode={mode} onModeChange={setMode} onFilesSelected={(files) => setAttachments(files)} disabled={pending} />
        </div>
        <div onPointerDown={startResize} className="absolute bottom-2 right-2 size-4 rounded-sm bg-muted border cursor-se-resize" />
      </Card>
    </div>
  )
}
