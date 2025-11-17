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
      setEmail("")
    } catch (error) {
      console.error(error)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Chia sẻ Mindmap</DialogTitle>
          <DialogDescription>
            Mời người khác cùng cộng tác trên <span className="font-medium text-foreground">{mindmapTitle}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Đường dẫn công khai</Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  readOnly 
                  value={typeof window !== 'undefined' ? window.location.href : '...'}
                  className="pl-9 bg-muted/50 text-muted-foreground cursor-text"
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">HOẶC GỬI LỜI MỜI</span>
            </div>
          </div>

          {/* === FORM MỜI EMAIL === */}
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email người nhận</Label>
              <div className="flex items-start gap-2">
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
                
                <div className="w-[110px] shrink-0">
                  <Select 
                    value={role} 
                    onValueChange={(value: "EDITOR" | "VIEWER") => setRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Quyền" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button type="submit" disabled={isLoading || !email} className="bg-primary text-primary-foreground">
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