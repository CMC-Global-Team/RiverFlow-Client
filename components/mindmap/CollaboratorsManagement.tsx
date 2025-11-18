"use client"

import { useState, useEffect } from "react"
import { 
  Trash2, 
  Edit2, 
  Mail, 
  Clock,
  ChevronDown,
  Users,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export interface Collaborator {
  id?: string
  email: string
  role: "EDITOR" | "VIEWER"
  invitedAt?: string
  acceptedAt?: string
  status?: "pending" | "accepted" | "rejected"
  invitedBy?: string
}

interface CollaboratorsManagementProps {
  mindmapId: string
  collaborators: Collaborator[]
  onUpdateRole: (email: string, role: "EDITOR" | "VIEWER") => Promise<void>
  onRemove: (email: string) => Promise<void>
  isLoading?: boolean
}

export default function CollaboratorsManagement({
  mindmapId,
  collaborators,
  onUpdateRole,
  onRemove,
  isLoading = false
}: CollaboratorsManagementProps) {
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null)
  const [editingEmail, setEditingEmail] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<"EDITOR" | "VIEWER">("VIEWER")
  const [loadingEmails, setLoadingEmails] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa xác nhận"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleUpdateRole = async (email: string, role: "EDITOR" | "VIEWER") => {
    if (role === newRole) {
      setEditingEmail(null)
      return
    }

    setLoadingEmails(prev => new Set(prev).add(email))
    try {
      await onUpdateRole(email, role)
      setNewRole(role)
      setEditingEmail(null)
      toast({ 
        description: `Đã cập nhật quyền của ${email}`
      })
    } catch (error) {
      toast({ 
        description: "Lỗi cập nhật quyền",
        variant: "destructive"
      })
    } finally {
      setLoadingEmails(prev => {
        const newSet = new Set(prev)
        newSet.delete(email)
        return newSet
      })
    }
  }

  const handleRemove = async (email: string) => {
    if (!confirm(`Bạn có chắc muốn xóa ${email} khỏi mindmap này?`)) {
      return
    }

    setLoadingEmails(prev => new Set(prev).add(email))
    try {
      await onRemove(email)
      setExpandedEmail(null)
      toast({ 
        description: `Đã xóa ${email} khỏi mindmap`
      })
    } catch (error) {
      toast({ 
        description: "Lỗi xóa collaborator",
        variant: "destructive"
      })
    } finally {
      setLoadingEmails(prev => {
        const newSet = new Set(prev)
        newSet.delete(email)
        return newSet
      })
    }
  }

  if (collaborators.length === 0) {
    return (
      <div className="text-center py-6">
        <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Chưa mời ai cộng tác</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Users className="h-4 w-4" />
        Danh sách người được mời ({collaborators.length})
      </h3>
      
      <div className="space-y-2">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.email}
            className="rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
          >
            <button
              onClick={() => setExpandedEmail(
                expandedEmail === collaborator.email ? null : collaborator.email
              )}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                  {collaborator.email?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{collaborator.email || 'Unknown'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      collaborator.role === "EDITOR" 
                        ? "bg-blue-500/20 text-blue-600" 
                        : "bg-gray-500/20 text-gray-600"
                    }`}>
                      {collaborator.role === "EDITOR" ? "Chỉnh sửa" : "Xem"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      collaborator.status === "accepted"
                        ? "bg-green-500/20 text-green-600"
                        : collaborator.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-600"
                        : "bg-red-500/20 text-red-600"
                    }`}>
                      {collaborator.status === "accepted" ? "Đã chấp nhận" : 
                       collaborator.status === "pending" ? "Chờ phản hồi" : "Từ chối"}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronDown 
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expandedEmail === collaborator.email ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedEmail === collaborator.email && (
              <div className="px-4 py-3 border-t border-border bg-muted/30 space-y-3">
                {/* Thời gian mời */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Mời lúc
                  </p>
                  <p className="text-xs text-foreground pl-4">
                    {formatDate(collaborator.invitedAt)}
                  </p>
                </div>

                {/* Thời gian chấp nhận */}
                {collaborator.acceptedAt && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Chấp nhận lúc
                    </p>
                    <p className="text-xs text-foreground pl-4">
                      {formatDate(collaborator.acceptedAt)}
                    </p>
                  </div>
                )}

                {/* Chỉnh sửa quyền */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">Chỉnh sửa quyền</p>
                  <Select
                    value={editingEmail === collaborator.email ? newRole : collaborator.role}
                    onValueChange={(value: "EDITOR" | "VIEWER") => {
                      setEditingEmail(collaborator.email)
                      setNewRole(value)
                    }}
                    disabled={loadingEmails.has(collaborator.email) || isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Xem</SelectItem>
                      <SelectItem value="EDITOR">Chỉnh sửa</SelectItem>
                    </SelectContent>
                  </Select>

                  {editingEmail === collaborator.email && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingEmail(null)
                          setNewRole("VIEWER")
                        }}
                        disabled={loadingEmails.has(collaborator.email) || isLoading}
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateRole(collaborator.email, newRole)}
                        disabled={loadingEmails.has(collaborator.email) || isLoading}
                      >
                        {loadingEmails.has(collaborator.email) && (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        )}
                        Lưu
                      </Button>
                    </div>
                  )}
                </div>

                {/* Xóa collaborator */}
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={() => handleRemove(collaborator.email)}
                  disabled={loadingEmails.has(collaborator.email) || isLoading}
                >
                  {loadingEmails.has(collaborator.email) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa khỏi mindmap
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
