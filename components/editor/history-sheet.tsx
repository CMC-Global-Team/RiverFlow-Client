"use client"

import { useEffect, useRef, useState } from "react"
import { GripVertical, X, RotateCcw, Calendar, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchHistoryPage, HistoryItem } from "@/services/mindmap/history.service"
import type { MindmapResponse, Collaborator } from "@/types/mindmap.types"
import { getSocket } from "@/lib/realtime"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import DateTimeWheel from "@/components/ui/datetime-wheel"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAvatarUrl } from "@/lib/avatar-utils"
import { useTranslation } from "react-i18next"

export default function HistorySheet({ mindmapId, mindmap, onClose }: { mindmapId: string; mindmap?: MindmapResponse; onClose: () => void }) {
  const { t } = useTranslation("editor")
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState({ x: 80, y: 80 })
  const [size, setSize] = useState({ width: 720, height: 500 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const { mindmap: ctxMindmap, restoreFromHistory, participants } = useMindmapContext()
  const [q, setQ] = useState("")
  const [selectedAction, setSelectedAction] = useState<string>("all")
  const [from, setFrom] = useState<string>("")
  const [to, setTo] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const seenRef = useRef<Set<string>>(new Set())


  const loadPage = async (reset = false, pageOverride?: number) => {
    setLoading(true)
    setError(null)
    try {
      const params: any = { page: pageOverride ?? currentPage, size: 20 }
      if (selectedAction !== "all") params.action = selectedAction
      if (from) params.from = from
      if (to) params.to = to
      if (q) params.q = q
      const { items: pageItems, meta } = await fetchHistoryPage(mindmapId, params)
      const filtered = pageItems.filter((it) => {
        if (seenRef.current.has(it.id)) return false
        seenRef.current.add(it.id)
        return true
      })
      const next = reset ? filtered : filtered
      setItems(next)
      setTotalPages(meta.totalPages || 0)
    } catch (e) {
      setError(t("history.error"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { seenRef.current.clear(); setCurrentPage(0); loadPage(true, 0) }, [mindmapId, q, selectedAction, from, to])

  // Pagination dạng số trang, bỏ infinite scroll

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ x: Math.max(24, window.innerWidth - (size.width + 40)), y: 100 })
    }
  }, [])

  useEffect(() => {
    const s = getSocket()
    const onHistoryLog = (entry: any) => {
      if (!entry || entry.mindmapId !== mindmapId) return
      setItems((prev) => {
        const id = String(entry.id || entry.createdAt || Date.now())
        if (seenRef.current.has(id)) return prev
        seenRef.current.add(id)
        const nextItem: HistoryItem = {
          id,
          mindmapId: entry.mindmapId,
          mysqlUserId: entry.mysqlUserId,
          action: entry.action,
          changes: entry.changes,
          snapshot: entry.snapshot,
          metadata: entry.metadata,
          createdAt: entry.createdAt,
          status: entry.status,
        }
        return [nextItem, ...prev]
      })
    }
    s.on('history:log', onHistoryLog)
    return () => {
      s.off('history:log', onHistoryLog)
    }
  }, [mindmapId])

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const dx = e.clientX - resizeStart.x
        const dy = e.clientY - resizeStart.y
        setSize({ width: Math.max(320, resizeStart.width + dx), height: Math.max(260, resizeStart.height + dy) })
      }
    }
    const handleGlobalMouseUp = () => {
      setIsResizing(false)
    }
    document.addEventListener("mousemove", handleGlobalMouseMove)
    document.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isResizing, resizeStart])

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.stopPropagation()
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  const handleMouseUp = () => {
    setIsDragging(false)
  }
  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true)
    setResizeStart({ x: e.clientX, y: e.clientY, width: size.width, height: size.height })
    e.stopPropagation()
  }

  const describe = (action: string, changes: any) => {
    try {
      const items = Array.isArray(changes?.items) ? changes.items : Array.isArray(changes) ? changes : null
      const count = changes?.count ?? (items ? items.length : undefined)
      switch (action) {
        case 'node_update':
          return count ? `${t("history.nodeUpdate")} (${count})` : t("history.nodeUpdate")
        case 'edge_update':
          return count ? `${t("history.edgeUpdate")} (${count})` : t("history.edgeUpdate")
        case 'edge_add':
          return t("history.edgeAdd")
        case 'node_add':
          return t("history.nodeAdd")
        case 'node_delete':
          return t("history.nodeDelete")
        case 'edge_delete':
          return t("history.edgeDelete")
        case 'viewport_change':
          return t("history.viewportChange")
        default:
          return action
      }
    } catch (_) {
      return action
    }
  }

  const apiBase = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_BACKEND_URL as string) : '') || 'https://river-flow.id.vn/api'
  const absolutize = (url?: string | null) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
    return `${base}${url}`
  }

  const getUserDisplay = (userId?: number) => {
    if (!userId) return { name: t("history.anonymousUser"), avatar: null }
    const isOwner = mindmap && mindmap.mysqlUserId === userId
    if (isOwner) {
      return { name: mindmap?.ownerName || t("toolbar.owner"), avatar: absolutize(mindmap?.ownerAvatar || (`/user/avatar/${userId}`)) }
    }
    const pres = Object.values(participants || {}).find((p: any) => String(p.userId ?? '') === String(userId)) as any
    if (pres) {
      const avatar = getAvatarUrl(pres.avatar || undefined)
      return { name: pres.name || t("history.anonymous"), avatar }
    }
    const collab = mindmap?.collaborators?.find((c: Collaborator) => c.mysqlUserId === userId)
    if (collab) {
      const avatar = getAvatarUrl(`/user/avatar/${userId}`)
      return { name: collab.email || t("history.anonymous"), avatar }
    }
    const avatar = getAvatarUrl(`/user/avatar/${userId}`)
    return { name: t("history.anonymous"), avatar }
  }

  const canRestore = () => {
    const m = mindmap || ctxMindmap
    if (!m) return false
    if (m.isPublic) return m.publicAccessLevel === 'edit'
    return true
  }

  const handleRestore = async (item: HistoryItem) => {
    try {
      if (!canRestore()) return
      const m = mindmap || ctxMindmap
      if (!m) return
      let snap: any = item.snapshot || null
      if (!snap) {
        const idx = items.findIndex((x) => x.id === item.id)
        for (let i = idx; i < items.length; i++) {
          const s: any = items[i]?.snapshot
          if (s && (Array.isArray(s.nodes) || Array.isArray(s.edges) || s.viewport)) { snap = s; break }
        }
        if (!snap) {
          for (let i = idx; i >= 0; i--) {
            const s: any = items[i]?.snapshot
            if (s && (Array.isArray(s.nodes) || Array.isArray(s.edges) || s.viewport)) { snap = s; break }
          }
        }
      }
      if (!snap) return
      await restoreFromHistory(snap, item.id)
    } catch { }
  }

  return (
    <div
      ref={sheetRef}
      className="fixed rounded-lg border border-border bg-card shadow-2xl backdrop-blur-sm bg-card/95 overflow-hidden z-50 pointer-events-auto"
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, width: `${size.width}px`, height: `${size.height}px`, cursor: isDragging ? 'grabbing' : 'default' }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="dialog"
      aria-modal="true"
    >
      <div className="sticky top-0 flex items-center justify-between p-3 border-b border-border bg-card/50 backdrop-blur-sm cursor-grab active:cursor-grabbing hover:bg-card/70 transition-colors flex-shrink-0 gap-2" onMouseDown={handleMouseDown}>
        <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <h3 className="text-sm font-semibold text-foreground">{t("history.title")}</h3>
        <div className="flex items-center gap-2 flex-1" onMouseDown={(e) => e.stopPropagation()}>
          <Input placeholder={t("history.search")} value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} className="h-8 text-sm w-40" />
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="h-8 w-36 text-sm">
              <SelectValue placeholder={t("history.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("history.allTypes")}</SelectItem>
              <SelectItem value="node_update">{t("history.nodeUpdate")}</SelectItem>
              <SelectItem value="edge_update">{t("history.edgeUpdate")}</SelectItem>
              <SelectItem value="edge_add">{t("history.edgeAdd")}</SelectItem>
              <SelectItem value="node_add">{t("history.nodeAdd")}</SelectItem>
              <SelectItem value="node_delete">{t("history.nodeDelete")}</SelectItem>
              <SelectItem value="edge_delete">{t("history.edgeDelete")}</SelectItem>
              <SelectItem value="viewport_change">{t("history.viewportChange")}</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                <Calendar className="h-3.5 w-3.5 mr-1" /><ArrowLeft className="h-3.5 w-3.5 mr-1" />
                {from ? new Date(from).toLocaleString() : t("history.from")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 bg-card/95 backdrop-blur-sm border border-border shadow-md">
              <DateTimeWheel value={from || ''} onChange={setFrom} />
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                <Calendar className="h-3.5 w-3.5 mr-1" /><ArrowRight className="h-3.5 w-3.5 mr-1" />
                {to ? new Date(to).toLocaleString() : t("history.to")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 bg-card/95 backdrop-blur-sm border border-border shadow-md">
              <DateTimeWheel value={to || ''} onChange={setTo} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 flex-shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div ref={scrollerRef} className="overflow-y-auto" style={{ height: `calc(100% - 85px)` }}>
        {loading && <div className="p-4 text-sm">{t("history.loading")}</div>}
        {error && <div className="p-4 text-sm text-destructive">{error}</div>}
        {!loading && !error && items.length === 0 && <div className="p-4 text-sm">{t("history.noHistory")}</div>}
        {!loading && !error && items.length > 0 && (
          <ul className="list-none m-0 p-0">
            {items.map((it) => {
              const u = getUserDisplay(it.mysqlUserId as any)
              return (
                <li key={it.id} className="p-3 border-b border-border">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const initials = (u.name || "?").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
                        return (
                          <Avatar className="size-6 ring-2 ring-background">
                            {u.avatar ? (
                              <AvatarImage src={u.avatar} alt={u.name || 'user'} />
                            ) : (
                              <AvatarFallback className="text-[10px] font-bold">{initials}</AvatarFallback>
                            )}
                          </Avatar>
                        )
                      })()}
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{t(`history.${it.action.replace(/_([a-z])/g, (g) => g[1].toUpperCase())}` as any, { defaultValue: it.action })}</span>
                        <span className="text-sm font-semibold">{describe(it.action, it.changes as any)}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="text-xs font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(it.createdAt).toLocaleString()}</div>
                      <Button variant="ghost" size="icon" title={t("history.restore")} aria-label={t("history.restore")} disabled={!canRestore()} onClick={() => handleRestore(it)} className="h-7 w-7">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
        <div className="p-2 flex items-center justify-center gap-2">
          {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i).slice(
            Math.max(0, currentPage - 2),
            Math.min(totalPages, currentPage + 3)
          ).map((p) => (
            <Button key={p} variant={p === currentPage ? "default" : "ghost"} size="sm" onClick={() => { setCurrentPage(p); loadPage(true, p) }}>{p + 1}</Button>
          ))}
        </div>
      </div>

      <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-primary/50 transition-colors" onMouseDown={handleResizeStart} />
    </div>
  )
}
