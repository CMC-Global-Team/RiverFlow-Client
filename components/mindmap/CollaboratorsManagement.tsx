"use client"

import { useState } from "react"
import { 
  Trash2, 
  Users,
  Loader2,
  AlertCircle
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
  const [loadingEmails, setLoadingEmails] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const handleUpdateRole = async (email: string, role: "EDITOR" | "VIEWER") => {
    const currentRole = collaborators.find(c => c.email === email)?.role
    if (role === currentRole) {
      return
    }

    setLoadingEmails(prev => new Set(prev).add(email))
    try {
      await onUpdateRole(email, role)
      toast({ 
        description: `Đã cập nhật quyền của ${email}`
      })
    } catch (error: any) {
      toast({ 
        description: error?.message || "Lỗi cập nhật quyền",
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

  const handleRemove = async (email: string, status?: string) => {
    if (!confirm(`Bạn có chắc muốn xóa ${email} khỏi mindmap này?`)) {
      return
    }

    setLoadingEmails(prev => new Set(prev).add(email))
    try {
      await onRemove(email)
      toast({ 
        description: `Đã xóa ${email} khỏi mindmap`
      })
    } catch (error: any) {
      toast({ 
        description: error?.response?.data?.message || "Lỗi xóa collaborator",
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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Users className="h-4 w-4" />
        Danh sách người được mời ({collaborators.length})
      </h3>
      
      <div className="space-y-2">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.email}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
          >
            {/* Left: Avatar & Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-semibold flex-shrink-0">
                {collaborator.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{collaborator.email || 'Unknown'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                    collaborator.role === "EDITOR" 
                      ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" 
                      : "bg-gray-500/20 text-gray-600 dark:text-gray-400"
                  }`}>
                    {collaborator.role === "EDITOR" ? "Chỉnh sửa" : "Xem"}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                    collaborator.status === "accepted"
                      ? "bg-green-500/20 text-green-600 dark:text-green-400"
                      : collaborator.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                      : "bg-red-500/20 text-red-600 dark:text-red-400"
                  }`}>
                    {collaborator.status === "accepted" ? "Đã chấp nhận" : 
                     collaborator.status === "pending" ? "Chờ phản hồi" : "Từ chối"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Role Selector - only for accepted collaborators */}
              {collaborator.status === "accepted" && (
                <Select
                  value={collaborator.role}
                  onValueChange={(value: "EDITOR" | "VIEWER") => 
                    handleUpdateRole(collaborator.email, value)
                  }
                  disabled={loadingEmails.has(collaborator.email) || isLoading}
                >
                  <SelectTrigger className="w-[100px] h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEWER">Xem</SelectItem>
                    <SelectItem value="EDITOR">Chỉnh sửa</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Delete Button */}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => handleRemove(collaborator.email, collaborator.status)}
                disabled={loadingEmails.has(collaborator.email) || isLoading || collaborator.status === "accepted"}
                title={collaborator.status === "accepted" ? "Không thể xóa thành viên đã chấp nhận" : "Xóa"}
              >
                {loadingEmails.has(collaborator.email) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : collaborator.status === "accepted" ? (
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
