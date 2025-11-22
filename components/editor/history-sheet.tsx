"use client"

import { useEffect, useRef, useState } from "react"
import { GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchHistory, HistoryItem } from "@/services/mindmap/history.service"

export default function HistorySheet({ mindmapId, onClose }: { mindmapId: string; onClose: () => void }) {
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
            {items.map((it) => (
              <li key={it.id} className="p-3 border-b border-border">
                <div className="text-sm font-semibold">{it.action}</div>
                <div className="text-xs text-muted-foreground">{new Date(it.createdAt).toLocaleString()}</div>
                {it.changes != null && (
                  <pre className="mt-2 text-xs bg-muted p-2 rounded-md overflow-x-auto">
                    {JSON.stringify(it.changes, null, 2)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize hover:bg-primary/50 transition-colors" onMouseDown={handleResizeStart} />
    </div>
  )
}
