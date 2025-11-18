"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Check, Copy, Link as LinkIcon, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import CollaboratorsManagement, { Collaborator } from "./CollaboratorsManagement"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (email: string, role: "EDITOR" | "VIEWER") => Promise<void>
  onUpdateRole?: (email: string, role: "EDITOR" | "VIEWER") => Promise<void>
  onRemoveCollaborator?: (email: string) => Promise<void>
  onTogglePublic?: (isPublic: boolean, accessLevel?: "view" | "edit" | "private") => Promise<void>
  mindmapTitle: string
  collaborators?: Collaborator[]
  isPublic?: boolean
  publicAccessLevel?: "view" | "edit" | "private"
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  onInvite,
  onUpdateRole,
  onRemoveCollaborator,
  onTogglePublic,
  mindmapTitle,
  collaborators = [],
  isPublic = false,
  publicAccessLevel = "private"
}: ShareModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("VIEWER")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [publicAccess, setPublicAccess] = useState<"view" | "edit" | "private">(publicAccessLevel)
  const [isPublicMode, setIsPublicMode] = useState(isPublic)
  const [isTogglingPublic, setIsTogglingPublic] = useState(false)
  const { toast } = useToast()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      await onInvite(email, role)
      setEmail("")
      toast({ 
        description: `Đã gửi lời mời tới ${email}`
      })
    } catch (error) {
      console.error(error)
      toast({
        description: "Lỗi gửi lời mời",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast({ description: "Đã sao chép liên kết vào bộ nhớ tạm" })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTogglePublic = async (newIsPublic: boolean) => {
    setIsTogglingPublic(true)
    try {
      if (onTogglePublic) {
        await onTogglePublic(newIsPublic, newIsPublic ? publicAccess : "private")
      }
      setIsPublicMode(newIsPublic)
      toast({
        description: newIsPublic ? "Mindmap đã được công khai" : "Mindmap đã được chuyển thành riêng tư"
      })
    } catch (error) {
      console.error(error)
      toast({
        description: "Lỗi cập nhật trạng thái công khai",
        variant: "destructive"
      })
    } finally {
      setIsTogglingPublic(false)
    }
  }

  const handleUpdateAccessLevel = async (newLevel: "view" | "edit" | "private") => {
    setIsTogglingPublic(true)
    try {
      if (onTogglePublic) {
        await onTogglePublic(isPublicMode, newLevel)
      }
      setPublicAccess(newLevel)
      toast({
        description: `Quyền truy cập công khai đã được cập nhật thành ${
          newLevel === "view" ? "Xem" : newLevel === "edit" ? "Chỉnh sửa" : "Riêng tư"
        }`
      })
    } catch (error) {
      console.error(error)
      toast({
        description: "Lỗi cập nhật quyền truy cập",
        variant: "destructive"
      })
    } finally {
      setIsTogglingPublic(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chia sẻ Mindmap</DialogTitle>
          <DialogDescription>
            Quản lý quyền truy cập cho <span className="font-medium text-foreground">{mindmapTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Đường dẫn công khai</TabsTrigger>
            <TabsTrigger value="collaborators" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Cộng tác viên</span>
              <span className="sm:hidden">{collaborators.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Đường dẫn công khai */}
          <TabsContent value="link" className="space-y-6 py-4">
            <div className="space-y-4">
              {/* Toggle công khai */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Công khai Mindmap</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Cho phép mọi người có liên kết truy cập mindmap này
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePublic(!isPublicMode)}
                    disabled={isTogglingPublic}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      isPublicMode ? "bg-blue-500" : "bg-gray-300"
                    } ${isTogglingPublic ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        isPublicMode ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Quyền truy cập công khai */}
              {isPublicMode && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quyền truy cập công khai</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { value: "view", label: "Xem", description: "Chỉ xem" },
                      { value: "edit", label: "Chỉnh sửa", description: "Xem và chỉnh sửa" },
                      { value: "private", label: "Riêng tư", description: "Chỉ chủ sở hữu" }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleUpdateAccessLevel(option.value as "view" | "edit" | "private")}
                        disabled={isTogglingPublic}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          publicAccess === option.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-border hover:border-blue-300"
                        } ${isTogglingPublic ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <p className="text-sm font-medium text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sao chép liên kết */}
              {isPublicMode && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Đường dẫn công khai</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        readOnly 
                        value={typeof window !== 'undefined' ? window.location.href : '...'}
                        className="pl-9 bg-muted/50 text-muted-foreground cursor-text text-sm"
                      />
                    </div>
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="shrink-0 border shadow-sm" 
                      onClick={handleCopyLink}
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Quản lý cộng tác viên */}
          <TabsContent value="collaborators" className="space-y-6 py-4">
            <div className="space-y-4">
              {/* Form mời cộng tác viên */}
              <form onSubmit={handleInvite} className="space-y-3 rounded-lg border border-border bg-card p-4">
                <h4 className="text-sm font-semibold text-foreground">Mời cộng tác viên</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email người nhận</Label>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <div className="relative flex-1">
                      <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    
                    <div className="w-full sm:w-[140px] shrink-0">
                      <Select 
                        value={role} 
                        onValueChange={(value: "EDITOR" | "VIEWER") => setRole(value)}
                        disabled={isLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Quyền" />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="VIEWER">Xem</SelectItem>
                          <SelectItem value="EDITOR">Chỉnh sửa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isLoading || !email}
                      className="bg-primary text-primary-foreground shrink-0"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? "Gửi..." : "Gửi lời mời"}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Danh sách cộng tác viên */}
              {onUpdateRole && onRemoveCollaborator && (
                <CollaboratorsManagement
                  mindmapId=""
                  collaborators={collaborators}
                  onUpdateRole={onUpdateRole}
                  onRemove={onRemoveCollaborator}
                  isLoading={isLoading}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}