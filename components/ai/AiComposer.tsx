"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Gauge, Sparkles, Upload, Send } from "lucide-react"

type ChatMode = "normal" | "max"

export default function AiComposer() {
  const [mode, setMode] = useState<ChatMode>("normal")
  const [value, setValue] = useState("")
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [size, setSize] = useState({ w: 920, h: 300 })
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })
  const sizeStart = useRef({ w: 920, h: 300 })
  const dragging = useRef(false)
  const resizing = useRef(false)

  useEffect(() => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1280
    const vh = typeof window !== "undefined" ? window.innerHeight : 800
    const w = Math.min(vw - 160, size.w)
    const h = size.h
    const x = Math.max(24, Math.floor(vw / 2 - w / 2))
    const y = Math.max(32, vh - h - 96)
    setSize({ w, h })
    setPos({ x, y })
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.target as HTMLElement
    if (el && el.closest('[data-no-drag="true"]')) return
    dragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
    posStart.current = { ...pos }
    window.addEventListener("pointermove", onPointerMove)
    window.addEventListener("pointerup", onPointerUp)
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging.current) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    const nx = Math.max(12, Math.min(vw - size.w - 12, posStart.current.x + dx))
    const ny = Math.max(12, Math.min(vh - size.h - 12, posStart.current.y + dy))
    setPos({ x: nx, y: ny })
  }
  const onPointerUp = () => {
    dragging.current = false
    window.removeEventListener("pointermove", onPointerMove)
    window.removeEventListener("pointerup", onPointerUp)
  }

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    resizing.current = true
    sizeStart.current = { ...size }
    dragStart.current = { x: e.clientX, y: e.clientY }
    window.addEventListener("pointermove", onResizeMove)
    window.addEventListener("pointerup", stopResize)
  }
  const onResizeMove = (e: PointerEvent) => {
    if (!resizing.current) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    const nw = Math.max(640, Math.min(vw - pos.x - 12, sizeStart.current.w + dx))
    const nh = Math.max(240, Math.min(vh - pos.y - 12, sizeStart.current.h + dy))
    setSize({ w: nw, h: nh })
  }
  const stopResize = () => {
    resizing.current = false
    window.removeEventListener("pointermove", onResizeMove)
    window.removeEventListener("pointerup", stopResize)
  }

  const handleSend = () => {
    if (!value.trim()) return
    setValue("")
  }

  return (
    <div className="pointer-events-auto" style={{ position: "absolute", left: pos.x, top: pos.y, width: size.w, height: size.h }}>
      <Card className="h-full bg-background/85 backdrop-blur border shadow-sm rounded-2xl p-3 flex flex-col" onPointerDown={onPointerDown}>
        <div className="flex-1" data-no-drag="true">
          <ScrollArea className="h-full pr-2">
            <div className="text-sm text-muted-foreground">Nhập yêu cầu để AI thiết kế mindmap theo ý tưởng của bạn.</div>
          </ScrollArea>
        </div>
        <div className="mt-2" data-no-drag="true">
          <div className="flex items-center justify-between mb-2">
            <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as ChatMode)} variant="outline" size="sm" className="gap-1">
              <ToggleGroupItem value="normal" className="h-7 px-3 text-xs rounded-full">
                <Gauge className="h-3.5 w-3.5 mr-1" />
                Normal
              </ToggleGroupItem>
              <ToggleGroupItem value="max" className="h-7 px-3 text-xs rounded-full data-[state=on]:bg-teal-600 data-[state=on]:text-white data-[state=on]:border-teal-600">
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Max
              </ToggleGroupItem>
            </ToggleGroup>
            <div>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => { if (fileRef.current) fileRef.current.value = "" }} />
              <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }} placeholder="Nhập yêu cầu cho AI mindmap" className="h-10 rounded-lg" />
            </div>
            <Button size="sm" className="gap-2 rounded-lg" onClick={handleSend}>
              <Send className="h-4 w-4" />
              Gửi
            </Button>
          </div>
        </div>
        <div onPointerDown={startResize} className="absolute bottom-2 right-2 size-4 rounded-sm bg-muted border cursor-se-resize" />
      </Card>
    </div>
  )
}

