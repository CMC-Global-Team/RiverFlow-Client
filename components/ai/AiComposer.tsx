"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { ArrowUp, ChevronDown, Coins, Plus, Sliders, MessageSquare, Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { optimizeMindmapByAI } from "@/services/mindmap/mindmap.service"
import type { MindmapResponse } from "@/types/mindmap.types"
 
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"

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

export default function AiComposer({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [mode, setMode] = useState<"normal" | "thinking" | "max">("normal")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const modeLabel = mode === "max" ? "Max Mode" : mode === "thinking" ? "Thinking Mode" : "Normal Mode"
  const [chatOpen, setChatOpen] = useState(defaultOpen)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; mode?: "normal" | "thinking" | "max" }[]>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<MindmapResponse | null>(null)
  const [structureType, setStructureType] = useState<"mindmap" | "logic" | "brace" | "org" | "tree" | "timeline" | "fishbone">("mindmap")
  const [langPref, setLangPref] = useState<"auto" | "vi" | "en">("auto")
  const { mindmap, selectedNode, setFullMindmapState } = useMindmapContext()

  const handleUploadClick = () => fileInputRef.current?.click()

  const mapModeToParams = () => {
    switch (mode) {
      case 'thinking':
        return { detailLevel: 'deep' as const, maxNodes: 40, maxDepth: 4 }
      case 'max':
        return { detailLevel: 'deep' as const, maxNodes: 60, maxDepth: 5 }
      default:
        return { detailLevel: 'normal' as const, maxNodes: 30, maxDepth: 3 }
    }
  }

  const detectLang = () => {
    if (typeof document !== 'undefined') {
      const htmlLang = document.documentElement.lang
      if (htmlLang) return htmlLang
    }
    if (typeof navigator !== 'undefined') {
      const n = navigator.language || ''
      if (n.toLowerCase().startsWith('vi')) return 'vi'
      if (n.toLowerCase().startsWith('en')) return 'en'
    }
    return 'vi'
  }

  const sendPrompt = async (text: string) => {
    setChatOpen(true)
    setLoading(true)
    setMessages((m) => [...m, { role: 'user', text, mode }])
    try {
      const lang = detectLang()
      if (mindmap?.id) {
        const modeLabel = mode
        const levels = modeLabel === 'max' ? 4 : modeLabel === 'thinking' ? 3 : 2
        const firstLevelCount = modeLabel === 'max' ? 6 : modeLabel === 'thinking' ? 5 : 4
        
        const payload: any = {
          mindmapId: mindmap.id,
          targetType: 'auto',
          nodeId: selectedNode ? selectedNode.id : undefined,
          language: langPref === 'auto' ? lang : langPref,
          mode: 'normal',
          hints: text ? [text] : undefined,
          levels,
          firstLevelCount,
          structureType,
        }
        const result = await optimizeMindmapByAI(payload)
        setLastResult(result)
        const summary = `Đã cập nhật mindmap hiện tại.`
        setMessages((m) => [...m, { role: 'assistant', text: summary }])

        const enrich = (r: MindmapResponse, pref: typeof structureType) => {
          const nodes = Array.isArray(r.nodes) ? [...r.nodes] : []
          const edges = Array.isArray(r.edges) ? [...r.edges] : []
          const inMap = new Map<string, number>()
          edges.forEach(e => {
            const t = String(e.target ?? e["target"]) || ""
            if (t) inMap.set(t, (inMap.get(t) || 0) + 1)
          })
          const rootNode = nodes.find(n => !inMap.has(String(n.id))) || nodes[0]
          const ax = Number(rootNode?.position?.x ?? 0) || 0
          const ay = Number(rootNode?.position?.y ?? 0) || 0
          const childrenByParent: Record<string, string[]> = {}
          edges.forEach(e => {
            const p = String(e.source ?? e["source"]) || ""
            const c = String(e.target ?? e["target"]) || ""
            if (!p || !c) return
            if (!childrenByParent[p]) childrenByParent[p] = []
            childrenByParent[p].push(c)
          })
          const depth = new Map<string, number>()
          const q: string[] = []
          if (rootNode?.id) { depth.set(String(rootNode.id), 0); q.push(String(rootNode.id)) }
          for (let i = 0; i < q.length; i++) {
            const pid = q[i]
            const d = depth.get(pid) || 0
            const kids = childrenByParent[pid] || []
            kids.forEach(cid => { if (!depth.has(cid)) { depth.set(cid, d + 1); q.push(cid) } })
          }
          const shapes = ["rectangle","circle","diamond","hexagon","ellipse","roundedRectangle"]
          const edgeTypes = ["smoothstep","step","straight"]
          const siblingsIndex: Record<string, number> = {}
          Object.keys(childrenByParent).forEach(pid => {
            const arr = childrenByParent[pid]
            arr.forEach((cid, idx) => { siblingsIndex[cid] = idx })
          })
          const siblingsCount: Record<string, number> = {}
          Object.keys(childrenByParent).forEach(pid => { siblingsCount[pid] = (childrenByParent[pid] || []).length })
          const jitter = () => (Math.random() - 0.5) * 60
          const radius = (d: number) => 240 + d * 60
          const angleFor = (cid: string, parentId: string) => {
            const idx = siblingsIndex[cid] || 0
            const total = (childrenByParent[parentId] || []).length || 1
            return (2 * Math.PI) * (idx / total)
          }
          const posFor = (n: any) => {
            const id = String(n.id)
            const d = depth.get(id) || 0
            const parentEntry = edges.find(e => String(e.target ?? e["target"]) === id)
            const parentId = parentEntry ? String(parentEntry.source ?? parentEntry["source"]) : String(rootNode?.id)
            if (pref === "timeline") {
              return { x: ax + d * 280 + jitter(), y: ay + ((siblingsIndex[id] || 0) - ((siblingsCount[parentId] || 1) / 2)) * 120 }
            }
            if (pref === "org" || pref === "tree") {
              return { x: ax + d * 280, y: ay + ((siblingsIndex[id] || 0) * 150) + jitter() }
            }
            if (pref === "fishbone") {
              const dir = d % 2 === 0 ? -1 : 1
              return { x: ax + d * 240 + jitter(), y: ay + dir * (80 + (siblingsIndex[id] || 0) * 40) }
            }
            const ang = angleFor(id, parentId)
            return { x: ax + radius(d) * Math.cos(ang) + jitter(), y: ay + radius(d) * Math.sin(ang) + jitter() }
          }
          const nextNodes = nodes.map(n => {
            const px = n.position?.x
            const py = n.position?.y
            const needs = (typeof px !== 'number' || typeof py !== 'number' || (px === 0 && py === 0))
            const p = needs ? posFor(n) : { x: px, y: py }
            const hasType = !!n.type && n.type !== 'default'
            const shape = n.data?.shape || shapes[Math.floor(Math.random() * shapes.length)]
            const type = hasType ? n.type : shape
            const data = { ...(n.data || {}), shape }
            return { ...n, type, position: p, data }
          })
          const nextEdges = edges.map(e => {
            const t = edgeTypes[Math.floor(Math.random() * edgeTypes.length)]
            return { ...e, type: t, animated: true }
          })
          return { ...r, nodes: nextNodes, edges: nextEdges }
        }

        const adjusted = enrich(result, structureType)
        setFullMindmapState(adjusted)
      } else {
        const msg = 'Lỗi (NO_MINDMAP): Vui lòng mở một mindmap trong Editor trước khi sử dụng AI.'
        setMessages((m) => [...m, { role: 'assistant', text: msg }])
      }
    } catch (err: any) {
      const code = err?.response?.data?.error?.code || 'ERROR'
      const message = err?.response?.data?.error?.message || err?.message || 'Không thể tạo mindmap.'
      const hints: string[] | undefined = err?.response?.data?.error?.hints
      const hintStr = hints && hints.length ? `\nGợi ý: ${hints.join(' • ')}` : ''
      setMessages((m) => [...m, { role: 'assistant', text: `Lỗi (${code}): ${message}${hintStr}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Draggable>
        <div className="rounded-2xl border bg-background shadow-md">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={handleUploadClick}>
                <Plus className="size-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                    <Sliders className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span>Structure</span>
                      <span className="ml-auto text-muted-foreground">
                        {structureType === "mindmap" ? "Mind Map" : structureType === "logic" ? "Logic Chart" : structureType === "brace" ? "Brace Map" : structureType === "org" ? "Org Chart" : structureType === "tree" ? "Tree Chart" : structureType === "timeline" ? "Timeline" : "Fishbone"}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup value={structureType} onValueChange={(v) => setStructureType(v as any)}>
                        <DropdownMenuRadioItem value="mindmap">Mind Map</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="logic">Logic Chart</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="brace">Brace Map</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="org">Org Chart</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="tree">Tree Chart</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="timeline">Timeline</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="fishbone">Fishbone</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span>Language</span>
                      <span className="ml-auto text-muted-foreground">
                        {langPref === "auto" ? "Auto" : langPref === "vi" ? "Tiếng Việt" : "English"}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup value={langPref} onValueChange={(v) => setLangPref(v as any)}>
                        <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="vi">Tiếng Việt</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setStructureType("mindmap")}>MindMap</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStructureType("logic")}>Logic Chart</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStructureType("brace")}>Brace Map</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStructureType("org")}>Org Chart</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStructureType("tree")}>Tree Chart</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStructureType("timeline")}>TimeLine</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStructureType("fishbone")}>Fishbone</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLangPref("auto")}>Language: Auto</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLangPref("vi")}>Language: Tiếng Việt</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLangPref("en")}>Language: English</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  if (!t || loading) return
                  setInputValue("")
                  void sendPrompt(t)
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
