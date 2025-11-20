"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import { useAuth } from "@/hooks/auth/useAuth"
import { getAvatarUrl } from "@/lib/avatar-utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import gsap from "gsap"

function RoleBadge({ label, variant }: { label: string; variant: "owner" | "collab" | "guest" | "public" }) {
  const map: Record<string, string> = {
    owner: "bg-blue-600 text-white",
    collab: "bg-emerald-600 text-white",
    guest: "bg-gray-500 text-white",
    public: "bg-purple-600 text-white",
  }
  return <span className={`px-2 py-0.5 rounded text-xs ${map[variant]}`}>{label}</span>
}

export default function PresenceAvatars() {
  const { participants, mindmap } = useMindmapContext()
  const { user, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const stackRef = useRef<HTMLDivElement>(null)
  const avatarRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const plusRef = useRef<HTMLDivElement | null>(null)
  const prevIdsRef = useRef<Set<string> | null>(null)

  const items = useMemo(() => {
    const list = Object.values(participants || {})
    const sorted = list.sort((a, b) => {
      const aOwner = mindmap && a.userId === mindmap.mysqlUserId ? 1 : 0
      const bOwner = mindmap && b.userId === mindmap.mysqlUserId ? 1 : 0
      if (aOwner !== bOwner) return bOwner - aOwner
      const aSelf = isAuthenticated && user && a.userId === user.userId ? 1 : 0
      const bSelf = isAuthenticated && user && b.userId === user.userId ? 1 : 0
      if (aSelf !== bSelf) return bSelf - aSelf
      return a.name.localeCompare(b.name)
    })
    return sorted
  }, [participants, mindmap, isAuthenticated, user])

  const visible = items.slice(0, 4)
  const hiddenCount = items.length > 4 ? items.length - 4 : 0

  const resolveAvatarUrl = (p: typeof items[number]) => {
    if (!mindmap) return undefined
    if (isAuthenticated && user && p.userId === user.userId) {
      return getAvatarUrl(user.avatar || "")
    }
    if (p.userId === mindmap.mysqlUserId && mindmap.ownerAvatar) {
      return getAvatarUrl(mindmap.ownerAvatar)
    }
    return undefined
  }

  const resolveRole = (p: typeof items[number]) => {
    if (!mindmap) return { label: "Khách", variant: "guest" as const }
    if (p.userId === mindmap.mysqlUserId) return { label: "Chủ sở hữu", variant: "owner" as const }
    if (p.userId) {
      const c = (mindmap.collaborators || []).find((cc: any) => cc.mysqlUserId === p.userId && cc.status === "accepted")
      if (c) return { label: c.role === "EDITOR" ? "Cộng tác viên (Edit)" : "Cộng tác viên (View)", variant: "collab" as const }
      if (mindmap.isPublic) {
        const lv = mindmap.publicAccessLevel === "edit" ? "Chỉnh sửa" : "Xem"
        return { label: `Công khai (${lv})`, variant: "public" as const }
      }
      return { label: "Khách", variant: "guest" as const }
    }
    if (mindmap.isPublic) {
      const lv = mindmap.publicAccessLevel === "edit" ? "Chỉnh sửa" : "Xem"
      return { label: `Công khai (${lv})`, variant: "public" as const }
    }
    return { label: "Khách", variant: "guest" as const }
  }

  useEffect(() => {
    const currentIds = new Set(items.map((p) => p.clientId))
    const prev = prevIdsRef.current
    if (!prev) {
      prevIdsRef.current = currentIds
      return
    }
    const joined: string[] = []
    const left: string[] = []
    currentIds.forEach((id) => { if (!prev.has(id)) joined.push(id) })
    prev.forEach((id) => { if (!currentIds.has(id)) left.push(id) })
    if (joined.length > 0) {
      for (const id of joined) {
        const el = avatarRefs.current[id]
        if (el) {
          gsap.fromTo(el, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out" })
        } else if (hiddenCount > 0 && plusRef.current) {
          gsap.fromTo(plusRef.current, { scale: 0.9 }, { scale: 1.05, duration: 0.16, yoyo: true, repeat: 1 })
        } else if (stackRef.current) {
          gsap.fromTo(stackRef.current, { scale: 0.98 }, { scale: 1.02, duration: 0.16, yoyo: true, repeat: 1 })
        }
      }
    }
    if (left.length > 0) {
      if (stackRef.current) {
        gsap.fromTo(stackRef.current, { scale: 1.02 }, { scale: 1.0, duration: 0.16 })
      }
      if (plusRef.current) {
        gsap.fromTo(plusRef.current, { scale: 1.05 }, { scale: 1.0, duration: 0.16 })
      }
    }
    prevIdsRef.current = currentIds
  }, [items, hiddenCount])

  return (
    <div className="flex items-center">
      <div ref={stackRef} className="flex -space-x-2 cursor-pointer" onClick={() => setOpen(true)}>
        {visible.map((p) => {
          const url = resolveAvatarUrl(p)
          const initials = (p.name || "?").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
          return (
            <Tooltip key={p.clientId}>
              <TooltipTrigger asChild>
                <div ref={(el) => { avatarRefs.current[p.clientId] = el }} className="relative">
                  <Avatar className="size-8 ring-2 ring-background">
                    {url ? (
                      <AvatarImage src={url} alt={p.name} />
                    ) : (
                      <AvatarFallback style={{ backgroundColor: p.color }} className="text-white text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
              </TooltipTrigger>
              <TooltipContent>{p.name}</TooltipContent>
            </Tooltip>
          )
        })}
        {hiddenCount > 0 && (
          <div ref={plusRef} className="relative">
            <div className="size-8 rounded-full bg-muted ring-2 ring-background flex items-center justify-center text-xs font-semibold text-foreground">
              +{hiddenCount}
            </div>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Người đang ở mindmap này</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 p-2">
            <Input
              placeholder="Tìm theo tên..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items
              .filter((p) => (p.name || "").toLowerCase().includes(query.toLowerCase()))
              .map((p) => {
              const url = resolveAvatarUrl(p)
              const initials = (p.name || "?").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
              const role = resolveRole(p)
              return (
                <div key={`row-${p.clientId}`} className="flex items-center gap-3 p-2 rounded-md border bg-card">
                  <Avatar className="size-9">
                    {url ? (
                      <AvatarImage src={url} alt={p.name} />
                    ) : (
                      <AvatarFallback style={{ backgroundColor: p.color }} className="text-white text-sm font-bold">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground truncate">{p.name}</div>
                    <div className="mt-1"><RoleBadge label={role.label} variant={role.variant} /></div>
                  </div>
                </div>
              )
            })}
            {items.filter((p) => (p.name || "").toLowerCase().includes(query.toLowerCase())).length === 0 && (
              <div className="text-sm text-muted-foreground">Chưa có ai tham gia</div>
            )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
