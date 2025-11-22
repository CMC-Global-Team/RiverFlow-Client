"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MindmapResponse } from "@/types/mindmap.types"

export default function HistoryFilters({
  q,
  setQ,
  selectedAction,
  setSelectedAction,
  selectedUserId,
  setSelectedUserId,
  from,
  setFrom,
  to,
  setTo,
  mindmap,
}: {
  q: string
  setQ: (v: string) => void
  selectedAction: string
  setSelectedAction: (v: string) => void
  selectedUserId: string
  setSelectedUserId: (v: string) => void
  from: string
  setFrom: (v: string) => void
  to: string
  setTo: (v: string) => void
  mindmap?: MindmapResponse
}) {
  return (
    <div className="px-3 py-2 border-t border-border bg-card/50 backdrop-blur-sm flex items-center gap-2">
      <Input placeholder="Tìm kiếm..." value={q} onChange={(e) => setQ(e.target.value)} className="h-8 text-sm" />
      <Select value={selectedAction} onValueChange={setSelectedAction}>
        <SelectTrigger className="h-8 w-40 text-sm">
          <SelectValue placeholder="Loại" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả loại</SelectItem>
          <SelectItem value="node_update">Cập nhật node</SelectItem>
          <SelectItem value="edge_update">Cập nhật connection</SelectItem>
          <SelectItem value="edge_add">Tạo connection</SelectItem>
          <SelectItem value="node_add">Tạo node</SelectItem>
          <SelectItem value="node_delete">Xóa node</SelectItem>
          <SelectItem value="edge_delete">Xóa connection</SelectItem>
          <SelectItem value="viewport_change">Thay đổi khung nhìn</SelectItem>
        </SelectContent>
      </Select>
      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
        <SelectTrigger className="h-8 w-48 text-sm">
          <SelectValue placeholder="Người dùng" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả người dùng</SelectItem>
          {Array.from(new Set([...(mindmap?.collaborators || []).map((c) => String(c.mysqlUserId || '')), String(mindmap?.mysqlUserId || '')].filter(Boolean))).map((id) => (
            <SelectItem key={id} value={id}>{id}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 text-sm" />
      <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 text-sm" />
    </div>
  )
}

