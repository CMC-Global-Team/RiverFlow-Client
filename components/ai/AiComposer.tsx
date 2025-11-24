"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp, ChevronDown, Coins, Plus, Sliders, MessageSquare, Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateAIMindmap, type AIMindmapV1 } from "@/services/ai/ai.service"

function Draggable({ children, initialPos, handle }: { children: React.ReactNode; initialPos?: { x: number; y: number }; handle?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const widthRef = useRef<number>(720)

  useEffect(() => {
    const place = () => {
      const w = widthRef.current
      if (initialPos) {
        setPos(initialPos)
      } else {
        const x = Math.max(16, Math.round((window.innerWidth - w) / 2))
        const y = Math.max(16, window.innerHeight - 120)
        setPos({ x, y })
      }
    }
    place()
    const r = () => place()
    window.addEventListener("resize", r)
    return () => window.removeEventListener("resize", r)
  }, [initialPos])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return
      const target = e.target as HTMLElement
      if (!ref.current.contains(target)) return
      if (handle && !target.closest(handle)) return
      const tag = target.tagName
      const interactive = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || target.isContentEditable || !!target.closest('[data-drag-ignore]')
      if (interactive) return
      const rect = ref.current.getBoundingClientRect()
      setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
      setDragging(true)
    }
    const onMove = (e: MouseEvent) => {
      if (!dragging) return
      setPos({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    }
    const onUp = () => setDragging(false)
    window.addEventListener("mousedown", onDown)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => {
      window.removeEventListener("mousedown", onDown)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [dragging, offset.x, offset.y])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    widthRef.current = el.getBoundingClientRect().width
  })

  return (
    <div ref={ref} className="fixed z-50 pointer-events-auto" style={{ left: pos.x, top: pos.y }}>
      {children}
    </div>
  )
}

export default function AiComposer() {
  const [mode, setMode] = useState<"normal" | "thinking" | "max">("normal")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const modeLabel = mode === "max" ? "Max Mode" : mode === "thinking" ? "Thinking Mode" : "Normal Mode"
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; mode?: "normal" | "thinking" | "max" }[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<AIMindmapV1 | null>(null)

  const handleUploadClick = () => fileInputRef.current?.click()

  // const mapModeToParams = () => {
  //   switch (mode) {
  //     case 'thinking':
  //       return { detailLevel: 'deep' as const, maxNodes: 40, maxDepth: 4 }
  //     case 'max':
  //       return { detailLevel: 'deep' as const, maxNodes: 60, maxDepth: 5 }
  //     default:
  //       return { detailLevel: 'normal' as const, maxNodes: 30, maxDepth: 3 }
  //   }
  // }

  // const detectLang = () => {
  //   if (typeof document !== 'undefined') {
  //     const htmlLang = document.documentElement.lang
  //     if (htmlLang) return htmlLang
  //   }
  //   if (typeof navigator !== 'undefined') {
  //     const n = navigator.language || ''
  //     if (n.toLowerCase().startsWith('vi')) return 'vi'
  //     if (n.toLowerCase().startsWith('en')) return 'en'
  //   }
  //   return 'vi'
  // }

  // const sendPrompt = async (text: string) => {
  //   setChatOpen(true)
  //   setLoading(true)
  //   setMessages((m) => [...m, { role: 'user', text, mode }])
  //   try {
  //     const params = mapModeToParams()
  //     const nowIso = new Date().toISOString()
  //     const lang = detectLang()
  //     const result = await generateAIMindmap({
  //       topic: text,
  //       detailLevel: params.detailLevel,
  //       maxNodes: params.maxNodes,
  //       maxDepth: params.maxDepth,
  //       lang,
  //       includeSources: false,
  //       nowIso,
  //     })
  //     setLastResult(result)
  //     const summary = `Đã tạo mindmap: ${result.topic} (${result.lang}). Tổng nút: ${Array.isArray(result.nodes) ? result.nodes.length : 0}.`
  //     setMessages((m) => [...m, { role: 'assistant', text: summary }])
  //   } catch (err: any) {
  //     const code = err?.response?.data?.error?.code || 'ERROR'
  //     const message = err?.response?.data?.error?.message || err?.message || 'Không thể tạo mindmap.'
  //     const hints: string[] | undefined = err?.response?.data?.error?.hints
  //     const hintStr = hints && hints.length ? `\nGợi ý: ${hints.join(' • ')}` : ''
  //     setMessages((m) => [...m, { role: 'assistant', text: `Lỗi (${code}): ${message}${hintStr}` }])
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  return (
    <>
      <Draggable>
        <div className="rounded-2xl border bg-muted/20 backdrop-blur-sm shadow-md">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={handleUploadClick}>
                <Plus className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                <Sliders className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => setChatOpen(true)}>
                <MessageSquare className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={handleUploadClick}>
                <Upload className="size-4" />
              </Button>
              <input ref={fileInputRef} type="file" className="hidden" />
            </div>
            <Input
              placeholder="Nhập nội dung của bạn"
              className="flex-1 h-10 rounded-xl bg-background/40 border-muted/50"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const t = inputValue.trim()
                  // if (!t || loading) return
                  setInputValue("")
                  // void sendPrompt(t)
                }
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 rounded-xl px-3 gap-1">
                  {modeLabel}
                  <ChevronDown className="size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setMode("normal")}>
                  <span className="flex-1">Normal Mode</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    -1
                    <Coins className="size-4" />
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("thinking")}>
                  <span className="flex-1">Thinking Mode</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    -3
                    <Coins className="size-4" />
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("max")}>
                  <span className="flex-1">Max Mode</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    -5
                    <Coins className="size-4" />
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="icon" className="size-10 rounded-xl" disabled={loading} onClick={() => {
              const t = inputValue.trim()
              if (!t || loading) return
              setInputValue("")
              void sendPrompt(t)
            }}>
              {loading ? <span className="animate-pulse text-xs">...</span> : <ArrowUp className="size-4" />}
            </Button>
          </div>
        </div>
      </Draggable>

      {chatOpen ? (
        <Draggable
          initialPos={{ x: Math.max(16, window.innerWidth - 420 - 16), y: Math.max(16, Math.round(window.innerHeight / 6)) }}
          handle=".draggable-handle"
        >
          <div className="w-[420px] rounded-2xl border bg-popover text-popover-foreground shadow-xl ring-1 ring-border">
            <div className="draggable-handle flex items-center justify-between gap-2 px-3 py-2 border-b cursor-move">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Cuộc hội thoại</span>
                <span className="text-xs px-2 py-1 rounded bg-muted">{modeLabel}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} title="Đóng">
                <X className="size-4" />
              </Button>
            </div>
            <ScrollArea className="h-[360px] p-3">
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                    <div className="flex flex-col items-end gap-1">
                      <div className={m.role === "user" ? "max-w-[80%] rounded-xl bg-primary text-primary-foreground px-3 py-2 shadow-sm" : "max-w-[80%] rounded-xl bg-muted px-3 py-2 shadow-sm"}>
                        {m.text}
                      </div>
                      {m.role === "user" && m.mode ? (
                        <div className="text-[11px] text-muted-foreground">{m.mode === "max" ? "Max Mode" : m.mode === "thinking" ? "Thinking Mode" : "Normal Mode"}</div>
                      ) : null}
                    </div>
                  </div>
                ))}
                {messages.length === 0 ? (
                  <div className="text-muted-foreground text-sm">Chưa có tin nhắn</div>
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </Draggable>
      ) : null}
    </>
  )
}
