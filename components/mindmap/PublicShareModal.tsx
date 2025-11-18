"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PublicShareModalProps {
  isOpen: boolean
  onClose: () => void
  mindmapTitle: string
  shareToken?: string
  ownerName?: string
  ownerAvatar?: string
  publicAccessLevel?: "view" | "edit" | "private"
}

export default function PublicShareModal({ 
  isOpen, 
  onClose, 
  mindmapTitle,
  shareToken,
  ownerName,
  ownerAvatar,
  publicAccessLevel
}: PublicShareModalProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const publicUrl = shareToken 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/public-mindmap?token=${shareToken}`
    : ''

  const accessLevelLabel = publicAccessLevel === "view" 
    ? "View Only" 
    : publicAccessLevel === "edit" 
    ? "Edit" 
    : "Private"

  const handleCopyLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      toast({
        description: "Link copied to clipboard!",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share "{mindmapTitle}"</DialogTitle>
          <DialogDescription>
            This is a public share link. Anyone with this link can access the mindmap.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Owner Info */}
          {ownerName && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {ownerAvatar && (
                <img 
                  src={ownerAvatar} 
                  alt={ownerName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Created by</p>
                <p className="text-sm font-medium">{ownerName}</p>
              </div>
            </div>
          )}

          {/* Access Level */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Access Level</p>
            <p className="text-sm font-medium">{accessLevelLabel}</p>
          </div>

          {/* Public Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Public Link</label>
            <div className="flex gap-2">
              <Input
                value={publicUrl}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="icon"
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link to allow anyone to view this mindmap
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
