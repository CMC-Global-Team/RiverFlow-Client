"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Check, Copy, Link as LinkIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (email: string, role: "EDITOR" | "VIEWER") => Promise<void>
  mindmapTitle: string
}

export default function ShareModal({ 
  isOpen, 
  onClose, 
  onInvite,
  mindmapTitle 
}: ShareModalProps) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"EDITOR" | "VIEWER">("VIEWER")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      await onInvite(email, role)
      setEmail("") // Reset form sau khi gửi thành công
      // Không đóng modal ngay để họ có thể mời tiếp người khác
    } catch (error) {
      // Lỗi đã được xử lý ở component cha, nhưng ta catch ở đây để tắt loading
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Chức năng copy link (Optional - làm sẵn cho đẹp)
  const handleCopyLink = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast({ description: "Đã sao chép liên kết vào bộ nhớ tạm" })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chia sẻ Mindmap</DialogTitle>
          <DialogDescription>
            Mời người khác cùng cộng tác trên <strong>{mindmapTitle}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Phần copy link nhanh */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">Đường dẫn công khai</Label>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <div className="flex items-center border rounded-md px-3 py-2 bg-muted/50 text-sm text-muted-foreground">
                  <LinkIcon className="h-4 w-4 mr-2 opacity-50" />
                  <span className="truncate select-all">{typeof window !== 'undefined' ? window.location.href : '...'}</span>
                </div>
              </div>
              <Button size="sm" variant="secondary" className="px-3" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Hoặc gửi lời mời</span>
            </div>
          </div>

          {/* Form mời qua email */}
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email người nhận</Label>
                <div className="flex gap-2">
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
                    />
                  </div>
                  
                  <Select 
                    value={role} 
                    onValueChange={(value: "EDITOR" | "VIEWER") => setRole(value)}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue placeholder="Quyền" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
               {/* Nút Cancel */}
              <Button type="button" variant="outline" onClick={onClose}>
                Đóng
              </Button>
              {/* Nút Submit */}
              <Button type="submit" disabled={isLoading || !email}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi lời mời
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}