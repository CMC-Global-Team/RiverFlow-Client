"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { MindmapProvider, useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import { ReactFlowProvider } from "reactflow"
import Toolbar from "@/components/editor/toolbar"
import ChatPanel from "@/components/editor/chat-panel"
import Canvas from "@/components/editor/canvas"
import PropertiesPanel from "@/components/editor/properties-panel"
import { useSearchParams, useRouter } from "next/navigation"
import gsap from "gsap"
import PublicShareModal from "@/components/mindmap/PublicShareModal"
import { getPublicMindmap } from "@/services/mindmap/mindmap.service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/auth/useAuth"
import HistorySheet from "@/components/editor/history-sheet"

function PublicMindmapInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const shareToken = searchParams.get('token')
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const { user } = useAuth()

  const {
    mindmap,
    isSaving,
    setTitle,
    saveStatus,
    setFullMindmapState,
    autoSaveEnabled,
    setAutoSaveEnabled,
    saveMindmap,
    accessRevoked,
    clearAccessRevoked,
  } = useMindmapContext()

  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loadedToken, setLoadedToken] = useState<string | null>(null)
  // Initialize userRole based on mindmap if available, otherwise null
  // For public mindmaps accessed via /public-mindmap route, default to viewer if publicAccessLevel is 'view'
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | null>(null)

  // Load public mindmap by share token
  useEffect(() => {
    if (shareToken && shareToken !== loadedToken) {
      const loadPublicMindmap = async () => {
        try {
          setIsLoading(true)
          console.log('Loading public mindmap with token:', shareToken)
          const data = await getPublicMindmap(shareToken)
          console.log('Successfully loaded public mindmap:', data)
          // Enforce public access: block if private
          if (data?.isPublic && data?.publicAccessLevel !== 'private') {
            const overlay = { ...data, shareToken: data.shareToken || shareToken }
            setFullMindmapState(overlay)
            setLoadedToken(shareToken)
            setError(null)
            const initialRole = data.publicAccessLevel === 'view' ? 'viewer' : 'editor'
            console.log('Setting initial userRole after load:', initialRole)
            setUserRole(initialRole)
          } else {
            const errorMsg = 'Mindmap này đang ở chế độ riêng tư.'
            setError(errorMsg)
            toast({ title: 'Access Denied', description: errorMsg, variant: 'destructive' })
          }
        } catch (err) {
          console.error('Failed to load public mindmap:', err)
          const errorMsg = err instanceof Error ? err.message : 'Failed to load mindmap. The link may be invalid or expired.'
          setError(errorMsg)
          toast({
            title: "Error",
            description: errorMsg,
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      loadPublicMindmap()
    }
  }, [shareToken, loadedToken, setFullMindmapState, toast])

  // Handle access revocation - redirect to home page when access is revoked
  useEffect(() => {
    if (accessRevoked?.revoked) {
      console.log('[PublicMindmap] Access revoked, redirecting to home:', accessRevoked)
      toast({
        title: 'Access Revoked',
        description: accessRevoked.message || 'This mindmap is no longer accessible.',
        variant: 'destructive',
      })
      clearAccessRevoked()
      router.push('/')
    }
  }, [accessRevoked, clearAccessRevoked, router, toast])

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
  }

  const handleTitleHover = () => {
    if (titleRef.current && !isEditing) {
      gsap.to(titleRef.current, {
        scale: 1.02,
        duration: 0.2,
        ease: "power2.out",
      })
    }
  }

  const handleTitleLeave = () => {
    if (titleRef.current && !isEditing) {
      gsap.to(titleRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      })
    }
  }

  // Determine user's role on this mindmap (similar to editor page logic)
  // MUST be called before any early returns to follow Rules of Hooks
  useEffect(() => {
    if (mindmap) {
      let role: 'owner' | 'editor' | 'viewer' | null = null

      if (user && mindmap.mysqlUserId === user.userId) {
        // User is the owner
        role = 'owner'
      } else {
        // Check collaborators if user is logged in
        if (user) {
          const collabEntry = mindmap.collaborators?.find(c => c.email === user.email)
          if (collabEntry && collabEntry.status === 'accepted') {
            // User is a collaborator
            role = collabEntry.role === 'EDITOR' ? 'editor' : 'viewer'
          } else if (mindmap.isPublic) {
            // User is logged in but not owner/collaborator, check public access level
            role = mindmap.publicAccessLevel === 'view' ? 'viewer' : 'editor'
          } else {
            // Not public and not collaborator
            role = null
          }
        } else {
          // User not logged in, check public access level
          if (mindmap.isPublic) {
            role = mindmap.publicAccessLevel === 'view' ? 'viewer' : 'editor'
          } else {
            role = null
          }
        }
      }

      console.log('PublicMindmap - Setting userRole:', {
        role,
        isPublic: mindmap.isPublic,
        publicAccessLevel: mindmap.publicAccessLevel,
        userId: user?.userId,
        mindmapOwnerId: mindmap.mysqlUserId,
        isOwner: user && mindmap.mysqlUserId === user.userId
      })

      setUserRole(role)
    } else {
      // Reset role when mindmap is not available
      setUserRole(null)
    }
  }, [mindmap, user])

  // Disable auto-save for VIEWER users
  // MUST be called before any early returns to follow Rules of Hooks
  useEffect(() => {
    if (userRole === 'viewer') {
      setAutoSaveEnabled(false)
    }
  }, [userRole, setAutoSaveEnabled])

  if (isLoading) {
    return (
      <div suppressHydrationWarning className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div suppressHydrationWarning className="flex h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Mindmap</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!mindmap) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const handleSave = async () => {
    try {
      await saveMindmap()
    } catch (error) {
      console.error('Save failed:', error)
      toast({ title: 'Save failed', description: 'Không thể lưu thay đổi.', variant: 'destructive' })
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Main Content - Full Screen */}
      <div className="flex-1 overflow-hidden relative">
        {/* Canvas Area */}
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 rounded-lg overflow-hidden">
            <Canvas readOnly={userRole === 'viewer'} />
          </div>
        </div>

        {/* Floating Toolbar with Header Items */}
        <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <Toolbar
              mindmap={mindmap}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              titleRef={titleRef as React.RefObject<HTMLHeadingElement>}
              handleTitleChange={handleTitleChange}
              handleTitleHover={handleTitleHover}
              handleTitleLeave={handleTitleLeave}
              autoSaveEnabled={autoSaveEnabled}
              setAutoSaveEnabled={setAutoSaveEnabled}
              isSaving={isSaving}
              saveStatus={saveStatus}
              handleSave={handleSave}
              onShareClick={() => setIsShareOpen(true)}
              userRole={userRole}
              onHistoryClick={() => setIsHistoryOpen(true)}
              onChatClick={() => setIsChatOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Floating Properties Panel - Outside relative container (same as editor page) */}
      <PropertiesPanel canEdit={userRole === 'editor' || userRole === 'owner'} />
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      {isHistoryOpen && mindmap?.id && (
        <HistorySheet mindmapId={mindmap.id} mindmap={mindmap} onClose={() => setIsHistoryOpen(false)} />
      )}

      <PublicShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        mindmapTitle={mindmap?.title || "Untitled Mindmap"}
        shareToken={shareToken || undefined}
        ownerName={mindmap?.ownerName}
        ownerAvatar={mindmap?.ownerAvatar}
        publicAccessLevel={mindmap?.publicAccessLevel || "private"}
      />
    </div>
  )
}

function PublicMindmapContent() {
  return (
    <ReactFlowProvider>
      <MindmapProvider>
        <PublicMindmapInner />
      </MindmapProvider>
    </ReactFlowProvider>
  )
}

export default function PublicMindmapPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <PublicMindmapContent />
    </Suspense>
  )
}
