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
import { Crown, Users as UsersIcon, Globe, User as UserIcon, Pencil, Eye, Search } from "lucide-react"

function RoleBadge({ label, variant }: { label: string; variant: "owner" | "collab" | "guest" | "public" }) {
  const map: Record<string, string> = {
    owner: "bg-blue-100 text-blue-700 border border-blue-200",
    collab: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    guest: "bg-gray-100 text-gray-700 border border-gray-200",
    public: "bg-purple-100 text-purple-700 border border-purple-200",
  }
  return <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${map[variant]}`}>{label}</span>
}

function RoleIconsRow({ kind, access }: { kind: "owner" | "collab" | "guest" | "public"; access?: "edit" | "view" | null }) {
  const iconSize = "h-4 w-4"
  const base = "shrink-0"
  return (
    <div className="flex items-center gap-2 select-none">
      {kind === "owner" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Crown className={`${iconSize} ${base} text-blue-600`} />
          </TooltipTrigger>
          <TooltipContent>Chủ sở hữu</TooltipContent>
        </Tooltip>
      )}
      {kind === "collab" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <UsersIcon className={`${iconSize} ${base} text-emerald-600`} />
          </TooltipTrigger>
          <TooltipContent>Cộng tác viên</TooltipContent>
        </Tooltip>
      )}
      {kind === "public" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Globe className={`${iconSize} ${base} text-purple-600`} />
          </TooltipTrigger>
          <TooltipContent>Công khai</TooltipContent>
        </Tooltip>
      )}
      {kind === "guest" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <UserIcon className={`${iconSize} ${base} text-gray-600`} />
          </TooltipTrigger>
          <TooltipContent>Khách</TooltipContent>
        </Tooltip>
      )}
      {access === "edit" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Pencil className={`${iconSize} ${base} text-muted-foreground`} />
          </TooltipTrigger>
          <TooltipContent>Chỉnh sửa</TooltipContent>
        </Tooltip>
      )}
      {access === "view" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Eye className={`${iconSize} ${base} text-muted-foreground`} />
          </TooltipTrigger>
          <TooltipContent>Xem</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
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
      const eq = (x: any, y: any) => String(x ?? '') === String(y ?? '')
      const aOwner = mindmap && eq(a.userId, mindmap.mysqlUserId) ? 1 : 0
      const bOwner = mindmap && eq(b.userId, mindmap.mysqlUserId) ? 1 : 0
      if (aOwner !== bOwner) return bOwner - aOwner
      const aSelf = isAuthenticated && user && eq(a.userId, user.userId) ? 1 : 0
      const bSelf = isAuthenticated && user && eq(b.userId, user.userId) ? 1 : 0
      if (aSelf !== bSelf) return bSelf - aSelf
      return a.name.localeCompare(b.name)
    })
    return sorted
  }, [participants, mindmap, isAuthenticated, user])

  const visible = items.slice(0, 4)
  const hiddenCount = items.length > 4 ? items.length - 4 : 0

  const resolveAvatarUrl = (p: typeof items[number]) => {
    if (p.avatar) {
      return getAvatarUrl(p.avatar)
    }
    if (isAuthenticated && user && p.userId === user.userId) {
      return getAvatarUrl(user.avatar || "")
    }
    if (mindmap && String(p.userId ?? '') === String(mindmap.mysqlUserId ?? '') && mindmap.ownerAvatar) {
      return getAvatarUrl(mindmap.ownerAvatar)
    }
    return undefined
  }

  const resolveRole = (p: typeof items[number]) => {
    if (!mindmap) return { kind: "guest" as const, access: null }
    if (String(p.userId ?? '') === String(mindmap.mysqlUserId ?? '')) return { kind: "owner" as const, access: null }
    if (p.userId) {
      const c = (mindmap.collaborators || []).find((cc: any) => String(cc.mysqlUserId ?? '') === String(p.userId ?? '') && cc.status === "accepted")
      if (c) return { kind: "collab" as const, access: c.role === "EDITOR" ? ("edit" as const) : ("view" as const) }
      if (mindmap.isPublic) {
        const lv = mindmap.publicAccessLevel === "edit" ? ("edit" as const) : ("view" as const)
        return { kind: "public" as const, access: lv }
      }
      return { kind: "guest" as const, access: null }
    }
    if (mindmap.isPublic) {
      const lv = mindmap.publicAccessLevel === "edit" ? ("edit" as const) : ("view" as const)
      return { kind: "public" as const, access: lv }
    }
    return { kind: "guest" as const, access: null }
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

  const gridContainerRef = useRef<HTMLDivElement>(null)
  const gridRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const dialogPrevIdsRef = useRef<Set<string> | null>(null)

  useEffect(() => {
    if (!open) return
    const filtered = items.filter((p) => (p.name || "").toLowerCase().includes(query.toLowerCase()))
    const ids = new Set(filtered.map((p) => p.clientId))
    const prev = dialogPrevIdsRef.current
    if (!prev) {
      dialogPrevIdsRef.current = ids
      return
    }
    const joined: string[] = []
    const left: string[] = []
    ids.forEach((id) => { if (!prev.has(id)) joined.push(id) })
    prev.forEach((id) => { if (!ids.has(id)) left.push(id) })
    if (joined.length > 0) {
      for (const id of joined) {
        const el = gridRefs.current[id]
        if (el) {
          gsap.fromTo(el, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.18, ease: "power2.out" })
        } else if (gridContainerRef.current) {
          gsap.fromTo(gridContainerRef.current, { scale: 0.98 }, { scale: 1.02, duration: 0.16, yoyo: true, repeat: 1 })
        }
      }
    }
    if (left.length > 0 && gridContainerRef.current) {
      gsap.fromTo(gridContainerRef.current, { scale: 1.02 }, { scale: 1.0, duration: 0.16 })
    }
    dialogPrevIdsRef.current = ids
  }, [items, open, query])

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
        <DialogContent className="sm:max-w-xl md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Người đang ở mindmap này</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="p-2 max-h-[60vh] overflow-y-auto">
            <div ref={gridContainerRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {items
              .filter((p) => (p.name || "").toLowerCase().includes(query.toLowerCase()))
              .map((p) => {
              const url = resolveAvatarUrl(p)
              const initials = (p.name || "?").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
              const role = resolveRole(p)
              return (
                <div ref={(el) => { gridRefs.current[p.clientId] = el }} key={`row-${p.clientId}`} className="flex items-center gap-3 p-2 rounded-md border bg-card select-none min-w-[260px] sm:min-w-[300px] md:min-w-[340px]">
                  <Avatar className="size-9">
                    {url ? (
                      <AvatarImage src={url} alt={p.name} />
                    ) : (
                      <AvatarFallback style={{ backgroundColor: p.color }} className="text-white text-sm font-bold">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground break-words">{p.name}</div>
                    <div className="mt-1"><RoleIconsRow kind={role.kind} access={role.access} /></div>
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
