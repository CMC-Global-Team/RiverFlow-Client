"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MindmapResponse } from "@/types/mindmap.types"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation('editor')
  return (
    <div className="px-3 py-2 border-t border-border bg-card/50 backdrop-blur-sm flex items-center gap-2">
      <Input placeholder={t("history.search")} value={q} onChange={(e) => setQ(e.target.value)} className="h-8 text-sm" />
      <Select value={selectedAction} onValueChange={setSelectedAction}>
        <SelectTrigger className="h-8 w-40 text-sm">
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
      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
        <SelectTrigger className="h-8 w-48 text-sm">
          <SelectValue placeholder={t("history.user")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("history.allUsers")}</SelectItem>
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

