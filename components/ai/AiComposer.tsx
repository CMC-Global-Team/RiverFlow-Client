"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { ArrowUp, ChevronDown, Coins, Plus, Sliders, MessageSquare, Upload, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { optimizeMindmapByAI } from "@/services/mindmap/mindmap.service"
import { useAuth } from "@/hooks/auth/useAuth"
import { getUserProfile } from "@/services/auth/update-user.service"
import { getSocket } from "@/lib/realtime"
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
  const { mindmap, nodes, edges, selectedNode, setFullMindmapState, saveMindmap, applyStreamingAdditions, updateNodeData, deleteNode } = useMindmapContext()
  const { user, updateUser } = useAuth()

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

  const shouldReplace = (s: string) => {
    const t = (s || '').toLowerCase()
    return /(sửa lại|đổi|thay|chuyển sang|thành|replace|change to|update to)/.test(t)
  }

  const inferTargetType = (s: string): 'node' | 'description' | 'structure' => {
    const t = (s || '').toLowerCase()
    if (/(sửa|chỉnh|update|edit|thay đổi|xóa|xoá|remove|delete)/.test(t)) return 'node'
    if (/(mô tả|description|ghi chú|note)/.test(t)) return 'description'
    return 'structure'
  }

  const buildContextHint = () => {
    const ns = Array.isArray(nodes) ? nodes : []
    const es = Array.isArray(edges) ? edges : []
    const inMap = new Map<string, number>()
    es.forEach(e => { const t = String((e as any).target || '') ; if (t) inMap.set(t, (inMap.get(t) || 0) + 1) })
    const rootNode = ns.find(n => !inMap.has(String(n.id))) || ns[0]
    const rootLabel = String(rootNode?.data?.label || rootNode?.id || '')
    const children = ns.filter(n => es.some(e => String((e as any).source || '') === String(rootNode?.id) && String((e as any).target || '') === String(n.id)))
      .map(n => String(n?.data?.label || n.id)).slice(0, 12)
    return `context: root=${rootLabel}; top-level=${children.join(', ')}; nodeCount=${ns.length};`
  }

  const normalizeAgentText = (t: string) => {
    const s = (t || '').replace(/^[^A-Za-zÀ-ỹ]+\s*/, '')
    if (/Agent:\s*action\s*=\s*replace/i.test(s)) {
      const m = s.match(/mentioned\s*=\s*(\d+)/i)
      const del = s.match(/prune\s*=\s*(\d+)/i)
      const edit = s.match(/edit\s*=\s*(\d+)/i)
      return `RiverFlow Agent: Kế hoạch thay thế toàn bộ (xóa: ${del?.[1] || 0}, sửa: ${edit?.[1] || 0}, liên quan: ${m?.[1] || 0})`
    }
    if (/Generate:\s*áp dụng\s*replace/i.test(s)) return 'RiverFlow Agent: Thực hiện thay thế mindmap theo kế hoạch'
    if (/Agent Plan:/i.test(s)) return 'RiverFlow Agent: Kế hoạch đã thiết lập'
    if (/Agent Analyze:/i.test(s)) {
      const tgt = s.match(/target\s*=\s*([a-z]+)/i)?.[1]
      const st = s.match(/structureType\s*=\s*([a-z]+)/i)?.[1]
      return `RiverFlow Agent: Phân tích tác vụ=${tgt || 'structure'}${st ? `, kiểu=${st}` : ''}`
    }
    if (/Pruned subtree of\s+/i.test(s)) {
      const lbl = s.replace(/.*Pruned subtree of\s+/i, '')
      return `RiverFlow Agent: Đã xóa toàn bộ nhánh "${lbl}"`
    }
    if (/Updated node label:/i.test(s)) {
      const m = s.match(/Updated node label:\s*(.+)\s*→\s*(.+)/i)
      return `RiverFlow Agent: Đã đổi tên node "${m?.[1] || ''}" thành "${m?.[2] || ''}"`
    }
    if (/Replace:\s*rebuilt structure with\s*(\d+)/i.test(s)) {
      const m = s.match(/Replace:\s*rebuilt structure with\s*(\d+)/i)
      return `RiverFlow Agent: Đã tạo lại cấu trúc gồm ${m?.[1] || '0'} node`
    }
    return `RiverFlow Agent: ${s}`
  }

  const composeAgentPlan = (text: string) => {
    const t = (text || '').toLowerCase()
    const ns = Array.isArray(nodes) ? nodes : []
    const es = Array.isArray(edges) ? edges : []
    const tokenize = (s: string) => s.toLowerCase().split(/[^a-zà-ỹ0-9]+/).filter(Boolean)
    const toks = tokenize(t)
    const mentioned: { id: string; label: string }[] = []
    for (const n of ns) {
      const lbl = String(n?.data?.label || '')
      const lt = tokenize(lbl)
      const hit = lt.some((w) => toks.includes(w))
      if (hit) mentioned.push({ id: String(n.id), label: lbl })
    }
    const wantsReplace = /(sửa lại|đổi|thay|chuyển sang|thành|replace|change to|update to)/.test(t)
    const wantsDelete = /(xóa|xoá|remove|delete|loại bỏ|bỏ|drop)/.test(t)
    const wantsEdit = /(sửa|chỉnh|update|edit|điều chỉnh)/.test(t)
    const wantsAdd = /(thêm|mở rộng|expand|add|tạo|generate|create)/.test(t)
    const pruneIds = wantsDelete ? (mentioned.length ? mentioned.map(m => m.id) : (selectedNode ? [String(selectedNode.id)] : [])) : []
    const editIds = wantsEdit ? (mentioned.length ? mentioned.map(m => m.id) : (selectedNode ? [String(selectedNode.id)] : [])) : []
    const action = wantsReplace ? 'replace' : wantsDelete ? 'prune' : wantsEdit ? 'edit' : wantsAdd ? 'expand' : 'expand'
    const plan = {
      action,
      pruneIds,
      editIds,
      mentioned,
      prefer: { structure: structureType, language: langPref },
      summary: `action=${action}; prune=${pruneIds.length}; edit=${editIds.length}; mentioned=${mentioned.length}`,
    }
    return plan
  }

  const sendPrompt = async (text: string) => {
    setChatOpen(true)
    setLoading(true)
    setMessages((m) => [...m, { role: 'user', text, mode }])
    try {
      const lang = detectLang()
      if (mindmap?.id) {
        const s = getSocket()
        s.emit('agent:typing', { isTyping: true })
        const modeLabel = mode
        const levels = modeLabel === 'max' ? 4 : modeLabel === 'thinking' ? 3 : 2
        const firstLevelCount = modeLabel === 'max' ? 6 : modeLabel === 'thinking' ? 5 : 4
        const agentPlan = composeAgentPlan(text)
        setMessages((m) => [...m, { role: 'assistant', text: normalizeAgentText(`Agent: ${agentPlan.summary}`) }])
        if (agentPlan.action === 'replace') {
          setFullMindmapState({ ...(mindmap as any), nodes: [], edges: [] })
        }
        if (agentPlan.action === 'prune' && agentPlan.pruneIds.length) {
          for (const id of agentPlan.pruneIds) deleteNode(id)
        }

        
        const payload: any = {
          mindmapId: mindmap.id,
          targetType: inferTargetType(text),
          nodeId: selectedNode ? selectedNode.id : undefined,
          language: langPref === 'auto' ? lang : langPref,
          mode: 'normal',
          hints: text ? [text, buildContextHint(), `AGENT_PLAN:${JSON.stringify(agentPlan)}`] : undefined,
          levels,
          firstLevelCount,
          structureType,
        }
        const result = await optimizeMindmapByAI(payload)
        setLastResult(result)
        const summary = `Generate: áp dụng ${agentPlan.action}`
        setMessages((m) => [...m, { role: 'assistant', text: normalizeAgentText(summary) }])
        if (Array.isArray((result as any)?.aiAgentLogs) && (result as any).aiAgentLogs.length) {
          const logs = (result as any).aiAgentLogs as string[]
          setMessages((m) => [...m, ...logs.map((t) => ({ role: 'assistant', text: normalizeAgentText(t) }))])
        }

        try {
          const profile = await getUserProfile()
          if (user) {
            updateUser({ ...user, credit: Number(profile.credit || 0) })
          }
        } catch {}

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
          const jitter = () => (Math.random() - 0.5) * 120
          const radius = (d: number) => 1200 + d * 400
          const angleFor = (cid: string, parentId: string) => {
            const idx = siblingsIndex[cid] || 0
            const total = (childrenByParent[parentId] || []).length || 1
            return (2 * Math.PI) * (idx / Math.max(1, total))
          }
          const minDist = 360
          const placed: { x: number; y: number }[] = []
          const posFor = (n: any) => {
            const id = String(n.id)
            const d = depth.get(id) || 0
            const parentEntry = edges.find(e => String(e.target ?? e["target"]) === id)
            const parentId = parentEntry ? String(parentEntry.source ?? parentEntry["source"]) : String(rootNode?.id)
            let p: { x: number; y: number }
            if (pref === "timeline") {
              p = { x: ax + d * 900 + jitter(), y: ay + ((siblingsIndex[id] || 0) - ((siblingsCount[parentId] || 1) / 2)) * 360 }
            } else if (pref === "org" || pref === "tree") {
              p = { x: ax + d * 800, y: ay + ((siblingsIndex[id] || 0) * 360) + jitter() }
            } else if (pref === "fishbone") {
              const dir = d % 2 === 0 ? -1 : 1
              p = { x: ax + d * 700 + jitter(), y: ay + dir * (300 + (siblingsIndex[id] || 0) * 160) }
            } else {
              const ang = angleFor(id, parentId)
              p = { x: ax + radius(d) * Math.cos(ang) + jitter(), y: ay + radius(d) * Math.sin(ang) + jitter() }
            }
            let tries = 0
            while (tries < 24) {
              let ok = true
              for (let i = 0; i < placed.length; i++) {
                const q = placed[i]
                const dx = p.x - q.x
                const dy = p.y - q.y
                if (Math.sqrt(dx * dx + dy * dy) < minDist) { ok = false; break }
              }
              if (ok) break
              p = { x: p.x + (Math.random() - 0.5) * minDist, y: p.y + (Math.random() - 0.5) * minDist }
              tries++
            }
            placed.push({ x: p.x, y: p.y })
            return p
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
          const nextEdges = edges.map(e => ({ ...e, type: 'smoothstep', animated: true }))
          return { ...r, nodes: nextNodes, edges: nextEdges }
        }

        const adjusted = enrich(result, structureType)

        const wantsReplace = agentPlan.action === 'replace'
        if (!wantsReplace) {
          const startNodes = Array.isArray(nodes) ? [...nodes] : []
          const addSeqNodes = Array.isArray(adjusted.nodes) ? [...adjusted.nodes] : []
          const addSeqEdges = Array.isArray(adjusted.edges) ? [...adjusted.edges] : []
          let curNodes = [...startNodes]
          const addedEdgeKeys = new Set<string>()
          const tick = () => {
            if (addSeqNodes.length > 0) {
              const n = addSeqNodes.shift() as any
              curNodes = [...curNodes, n]
              const eReady = addSeqEdges
                .filter((e) => curNodes.some((cn) => String(cn.id) === String(e.source)) && curNodes.some((cn) => String(cn.id) === String(e.target)))
                .filter((e) => {
                  const k = `${String((e as any).source)}|${String((e as any).target)}|${String((e as any).sourceHandle || '')}|${String((e as any).targetHandle || '')}`
                  if (addedEdgeKeys.has(k)) return false
                  addedEdgeKeys.add(k)
                  return true
                })
              applyStreamingAdditions([n], eReady)
              setTimeout(tick, 45)
            } else {
              void saveMindmap()
            }
          }
          setTimeout(tick, 60)
        } else {
          setFullMindmapState({ ...(mindmap as any), nodes: [], edges: [] })
          const addSeqNodes = Array.isArray(adjusted.nodes) ? [...adjusted.nodes] : []
          const addSeqEdges = Array.isArray(adjusted.edges) ? [...adjusted.edges] : []
          let curNodes: any[] = []
          const addedEdgeKeys = new Set<string>()
          const tick = () => {
            if (addSeqNodes.length > 0) {
              const n = addSeqNodes.shift() as any
              curNodes = [...curNodes, n]
              const eReady = addSeqEdges
                .filter((e) => curNodes.some((cn) => String(cn.id) === String(e.source)) && curNodes.some((cn) => String(cn.id) === String(e.target)))
                .filter((e) => {
                  const k = `${String((e as any).source)}|${String((e as any).target)}|${String((e as any).sourceHandle || '')}|${String((e as any).targetHandle || '')}`
                  if (addedEdgeKeys.has(k)) return false
                  addedEdgeKeys.add(k)
                  return true
                })
              applyStreamingAdditions([n], eReady)
              setTimeout(tick, 45)
            } else {
              void saveMindmap()
            }
          }
          setTimeout(tick, 60)
        }
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
      try {
        const s = getSocket()
        s.emit('agent:typing', { isTyping: false })
      } catch {}
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
                  <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                    <Sliders className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[260px] p-2 bg-background shadow-md border rounded-xl">
                  <DropdownMenuLabel>Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <span>Structure</span>
                      <span className="ml-auto text-muted-foreground">
                        {structureType === "mindmap" ? "Mind Map" : structureType === "logic" ? "Logic Chart" : structureType === "brace" ? "Brace Map" : structureType === "org" ? "Org Chart" : structureType === "tree" ? "Tree Chart" : structureType === "timeline" ? "Timeline" : "Fishbone"}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="min-w-[240px] p-2 bg-background shadow-md border rounded-lg">
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
                    <DropdownMenuSubContent className="min-w-[200px] p-2 bg-background shadow-md border rounded-lg">
                      <DropdownMenuRadioGroup value={langPref} onValueChange={(v) => setLangPref(v as any)}>
                        <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="vi">Tiếng Việt</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
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
            <div className="ml-1 inline-flex items-center gap-1 px-2 h-8 rounded-lg border bg-muted">
              <Coins className="size-4 text-yellow-500" />
              <span className="text-sm">{Number(user?.credit || 0)}</span>
            </div>
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
                    <div className="flex flex-col items-start gap-1">
                      {m.role !== "user" ? (
                        <div className="text-[11px] text-muted-foreground">RiverFlow Agent</div>
                      ) : null}
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
