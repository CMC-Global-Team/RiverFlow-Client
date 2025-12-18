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
import { useTranslation, Trans } from "react-i18next"

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
  isOwner?: boolean
  shareToken?: string
  mindmapId?: string
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
  publicAccessLevel = "private",
  isOwner = false,
  shareToken,
  mindmapId
}: ShareModalProps) {
  const { t } = useTranslation("shareModal")
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
        description: t("collaborators.inviteSuccess", { email })
      })
    } catch (error) {
      console.error(error)
      toast({
        description: t("collaborators.inviteError"),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    // Generate public link based on access level and shareToken
    let publicUrl = ''
    if (isPublic && shareToken) {
      // For public mindmaps, always use /public-mindmap route with token
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      publicUrl = `${origin}/public-mindmap?token=${shareToken}`
    } else if (mindmapId) {
      // Fallback to editor link if no shareToken
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      publicUrl = `${origin}/editor?id=${mindmapId}`
    } else {
      // Last resort: current URL
      publicUrl = typeof window !== 'undefined' ? window.location.href : ''
    }

    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast({ description: t("publicLink.copySuccess") })
    setTimeout(() => setCopied(false), 2000)
  }

  // Generate public URL for display
  const getPublicUrl = () => {
    if (isPublic && shareToken) {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      return `${origin}/public-mindmap?token=${shareToken}`
    } else if (mindmapId) {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      return `${origin}/editor?id=${mindmapId}`
    }
    return typeof window !== 'undefined' ? window.location.href : '...'
  }

  const handleTogglePublic = async (newIsPublic: boolean) => {
    setIsTogglingPublic(true)
    try {
      if (onTogglePublic) {
        await onTogglePublic(newIsPublic, newIsPublic ? publicAccess : "private")
      }
      setIsPublicMode(newIsPublic)
      toast({
        description: newIsPublic ? t("publicLink.publicUpdateSuccess") : t("publicLink.privateUpdateSuccess")
      })
    } catch (error) {
      console.error(error)
      toast({
        description: t("publicLink.updateError"),
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
      const levelLabel = t(`publicLink.levels.${newLevel}.label`);
      toast({
        description: t("publicLink.accessUpdateSuccess", { level: levelLabel })
      })
    } catch (error) {
      console.error(error)
      toast({
        description: t("publicLink.accessUpdateError"),
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
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            <Trans i18nKey="description" ns="shareModal" values={{ title: mindmapTitle }}>
              Manage access for <span className="font-medium text-foreground">{{ title: mindmapTitle }}</span>.
            </Trans>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">{t("tabs.link")}</TabsTrigger>
            <TabsTrigger value="collaborators" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{t("tabs.collaborators")}</span>
              <span className="sm:hidden">{collaborators.length}</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Public Link */}
          <TabsContent value="link" className="space-y-6 py-4">
            <div className="space-y-4">
              {/* Public Toggle */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{t("publicLink.title")}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("publicLink.description")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleTogglePublic(!isPublicMode)}
                    disabled={isTogglingPublic}
                    className={`relative w-11 h-6 rounded-full transition-colors ${isPublicMode ? "bg-blue-500" : "bg-gray-300"
                      } ${isTogglingPublic ? "opacity-50" : ""}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPublicMode ? "translate-x-5" : ""
                        }`}
                    />
                  </button>
                </div>
              </div>

              {/* Public Access Level */}
              {isPublicMode && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("publicLink.accessLevel")}</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {(["view", "edit", "private"] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => handleUpdateAccessLevel(option)}
                        disabled={isTogglingPublic}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${publicAccess === option
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-border hover:border-blue-300"
                          } ${isTogglingPublic ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <p className="text-sm font-medium text-foreground">{t(`publicLink.levels.${option}.label`)}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t(`publicLink.levels.${option}.description`)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy Link */}
              {isPublicMode && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("publicLink.linkLabel")}</Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        readOnly
                        value={getPublicUrl()}
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

          {/* Tab 2: Collaborators */}
          <TabsContent value="collaborators" className="space-y-6 py-4">
            <div className="space-y-4">
              {/* Invite Form */}
              <form onSubmit={handleInvite} className="space-y-3 rounded-lg border border-border bg-card p-4">
                <h4 className="text-sm font-semibold text-foreground">{t("collaborators.inviteTitle")}</h4>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">{t("collaborators.emailLabel")}</Label>
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
                          <SelectValue placeholder={t("collaborators.rolePlaceholder")} />
                        </SelectTrigger>
                        <SelectContent align="end">
                          <SelectItem value="VIEWER">{t("collaborators.roles.viewer")}</SelectItem>
                          <SelectItem value="EDITOR">{t("collaborators.roles.editor")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="bg-primary text-primary-foreground shrink-0"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isLoading ? t("collaborators.sending") : t("collaborators.sendInvite")}
                    </Button>
                  </div>
                </div>
              </form>

              {/* Collaborators List */}
              {onUpdateRole && onRemoveCollaborator && (
                <CollaboratorsManagement
                  mindmapId=""
                  collaborators={collaborators}
                  onUpdateRole={onUpdateRole}
                  isOwner={isOwner}
                  onRemove={onRemoveCollaborator}
                  isLoading={isLoading}
                />
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
