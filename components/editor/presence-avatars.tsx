"use client"

import { useMemo, useState } from "react"
import { useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import { useAuth } from "@/hooks/auth/useAuth"
import { getAvatarUrl } from "@/lib/avatar-utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

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

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2 cursor-pointer" onClick={() => setOpen(true)}>
        {visible.map((p) => {
          const url = resolveAvatarUrl(p)
          const initials = (p.name || "?").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
          return (
            <Tooltip key={p.clientId}>
              <TooltipTrigger asChild>
                <div className="relative">
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
          <div className="relative">
            <div className="size-8 rounded-full bg-muted ring-2 ring-background flex items-center justify-center text-xs font-semibold text-foreground">
              +{hiddenCount}
            </div>
          </div>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>Người đang ở mindmap này</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 p-2 max-h-[70vh] overflow-y-auto">
            {items.map((p) => {
              const url = resolveAvatarUrl(p)
              const initials = (p.name || "?").split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
              const role = resolveRole(p)
              return (
                <div key={`row-${p.clientId}`} className="flex items-center gap-3 p-2 rounded-md border">
                  <Avatar className="size-8">
                    {url ? (
                      <AvatarImage src={url} alt={p.name} />
                    ) : (
                      <AvatarFallback style={{ backgroundColor: p.color }} className="text-white text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{p.name}</div>
                    <div className="mt-1"><RoleBadge label={role.label} variant={role.variant} /></div>
                  </div>
                </div>
              )
            })}
            {items.length === 0 && (
              <div className="text-sm text-muted-foreground">Chưa có ai tham gia</div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

