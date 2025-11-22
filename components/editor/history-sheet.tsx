"use client"

import { useEffect, useRef, useState } from "react"
import { GripVertical, X, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchHistory, HistoryItem } from "@/services/mindmap/history.service"
import type { MindmapResponse, Collaborator } from "@/types/mindmap.types"
import { getSocket } from "@/lib/realtime"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"

export default function HistorySheet({ mindmapId, mindmap, onClose }: { mindmapId: string; mindmap?: MindmapResponse; onClose: () => void }) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState({ x: 80, y: 80 })
  const [size, setSize] = useState({ width: 420, height: 380 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const { mindmap: ctxMindmap, setFullMindmapState, saveMindmap } = useMindmapContext()

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await fetchHistory(mindmapId, { limit: 100 })
        setItems(data)
      } catch (e) {
        setError("Không tải được lịch sử")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [mindmapId])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({ x: window.innerWidth - 450, y: 100 })
    }
  }, [])

  useEffect(() => {
    const s = getSocket()
    const onHistoryLog = (entry: any) => {
      if (!entry || entry.mindmapId !== mindmapId) return
      setItems((prev) => [{
        id: entry.id || `${Date.now()}`,
        mindmapId: entry.mindmapId,
        mysqlUserId: entry.mysqlUserId,
        action: entry.action,
        changes: entry.changes,
        snapshot: entry.snapshot,
        metadata: entry.metadata,
        createdAt: entry.createdAt,
        status: entry.status,
      }, ...prev].slice(0, 200))
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
          return count ? `Cập nhật ${count} node` : 'Cập nhật node'
        case 'edge_update':
          return count ? `Cập nhật ${count} connection` : 'Cập nhật connection'
        case 'edge_add':
          return 'Tạo connection'
        case 'node_add':
          return 'Tạo node'
        case 'node_delete':
          return 'Xóa node'
        case 'edge_delete':
          return 'Xóa connection'
        case 'viewport_change':
          return 'Thay đổi khung nhìn'
        default:
          return action
      }
    } catch (_) {
      return action
    }
  }

  const apiBase = (typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_BACKEND_URL as string) : '') || 'https://riverflow-server.onrender.com/api'
  const absolutize = (url?: string | null) => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
    return `${base}${url}`
  }

  const getUserDisplay = (userId?: number) => {
    if (!userId) return { name: 'Không rõ người dùng', avatar: null }
    const isOwner = mindmap && mindmap.mysqlUserId === userId
    if (isOwner) {
      return { name: mindmap?.ownerName || 'Chủ sở hữu', avatar: absolutize(mindmap?.ownerAvatar || (`/user/avatar/${userId}`)) }
    }
    const collab = mindmap?.collaborators?.find((c: Collaborator) => c.mysqlUserId === userId)
    if (collab) {
      return { name: collab.email || `User #${userId}`, avatar: absolutize(`/user/avatar/${userId}`) }
    }
    return { name: `User #${userId}`, avatar: absolutize(`/user/avatar/${userId}`) }
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
      const snap: any = item.snapshot || {}
      const nextState = {
        ...m,
        nodes: Array.isArray(snap.nodes) ? snap.nodes : m.nodes,
        edges: Array.isArray(snap.edges) ? snap.edges : m.edges,
        viewport: snap.viewport || m.viewport,
      }
      setFullMindmapState(nextState as any)
      await saveMindmap()
      const s = getSocket()
      const room = `mindmap:${m.id}`
      s.emit('history:restore', room, { historyId: item.id, snapshot: snap })
    } catch {}
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
        <h3 className="text-sm font-semibold text-foreground flex-1 min-w-0">Lịch sử thay đổi</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 flex-shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-y-auto" style={{ height: `calc(100% - 45px)` }}>
        {loading && <div className="p-4 text-sm">Đang tải...</div>}
        {error && <div className="p-4 text-sm text-destructive">{error}</div>}
        {!loading && !error && items.length === 0 && <div className="p-4 text-sm">Chưa có lịch sử</div>}
        {!loading && !error && items.length > 0 && (
          <ul className="list-none m-0 p-0">
            {items.map((it) => {
              const u = getUserDisplay(it.mysqlUserId as any)
              return (
                <li key={it.id} className="p-3 border-b border-border">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name || 'user'} width={24} height={24} className="rounded-full" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">{it.action}</span>
                        <span className="text-sm font-semibold">{describe(it.action, it.changes as any)}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div className="text-xs font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{new Date(it.createdAt).toLocaleString()}</div>
                      <Button variant="ghost" size="sm" disabled={!it.snapshot || !canRestore()} onClick={() => handleRestore(it)}>Quay về</Button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-primary/50 transition-colors" onMouseDown={handleResizeStart} />
    </div>
  )
}
