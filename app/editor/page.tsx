"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Users, Loader2, Check, AlertCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { MindmapProvider, useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import { ReactFlowProvider } from "reactflow"
import Toolbar from "@/components/editor/toolbar"
import ChatPanel from "@/components/editor/chat-panel"
import Canvas from "@/components/editor/canvas"
import PropertiesPanel from "@/components/editor/properties-panel"
import BackButton from "@/components/editor/back-button"
import { useSearchParams, useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import gsap from "gsap"
import { ThemeSwitcher } from "@/components/theme-switcher"
import ShareModal from "@/components/mindmap/ShareModal"
  import PublicShareModal from "@/components/mindmap/PublicShareModal"
  import { 
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    updatePublicAccess,
    getCollaborators,
    getPendingInvitations,
    getPublicMindmap,
    getMindmapById
  } from "@/services/mindmap/mindmap.service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/auth/useAuth"
import HistorySheet from "@/components/editor/history-sheet"

function EditorInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mindmapId = searchParams.get('id')
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const { user } = useAuth()
  
  const {
    mindmap,
    saveMindmap,
    loadMindmap,
    isSaving,
    setTitle,
    autoSaveEnabled,
    setAutoSaveEnabled,
    saveStatus,
    setFullMindmapState,
  } = useMindmapContext()
  
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false)
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | null>(null)
  const toArray = (input: any): any[] => {
    if (Array.isArray(input)) return input
    if (input && typeof input === 'object') {
      if (Array.isArray((input as any).collaborators)) return (input as any).collaborators
      const data = (input as any).data
      if (Array.isArray(data?.collaborators)) return data.collaborators
      if (Array.isArray(data)) return data
    }
    return []
  }

  // Determine user's role on this mindmap
  useEffect(() => {
    if (mindmap) {
      if (user && mindmap.mysqlUserId === user.userId) {
        setUserRole('owner')
      } else {
        if (user) {
          const collabEntry = mindmap.collaborators?.find(c => c.email === user.email)
          if (collabEntry && collabEntry.status === 'accepted') {
            setUserRole(collabEntry.role === 'EDITOR' ? 'editor' : 'viewer')
          } else if (mindmap.isPublic) {
            const access = mindmap.publicAccessLevel
            if (access === 'edit') setUserRole('editor')
            else if (access === 'view') setUserRole('viewer')
            else setUserRole(null)
          } else {
            setUserRole(null)
          }
        } else if (mindmap.isPublic) {
          const access = mindmap.publicAccessLevel
          if (access === 'edit') setUserRole('editor')
          else if (access === 'view') setUserRole('viewer')
          else setUserRole(null)
        } else {
          setUserRole(null)
        }
      }
    }
  }, [mindmap, user])

  // Disable auto-save for VIEWER users
  useEffect(() => {
    if (userRole === 'viewer') {
      setAutoSaveEnabled(false)
    }
  }, [userRole, setAutoSaveEnabled])

  // Load collaborators when mindmap is loaded
  useEffect(() => {
    const loadCollaborators = async () => {
      if (mindmapId) {
        setIsLoadingCollaborators(true)
        try {
          // Only owners can load pending invitations
          const isOwner = mindmap?.mysqlUserId === user?.userId
          const acceptedCollab = await getCollaborators(mindmapId)
          const acceptedList = toArray(acceptedCollab)
          let pendingInvitesRaw: any[] = []
          if (isOwner) {
            try {
              pendingInvitesRaw = await getPendingInvitations(mindmapId)
            } catch (error) {
              console.warn('Cannot load pending invitations (non-owner)', error)
              pendingInvitesRaw = []
            }
          }
          const pendingInvites = toArray(pendingInvitesRaw)

          // Map pending invitations to collaborator format
          const pendingCollaborators = (pendingInvites || [])
            .filter((invitation: any) => invitation?.invitedEmail) // Filter out null emails
            .map((invitation: any) => ({
              email: invitation.invitedEmail,
              role: invitation.role,
              invitedAt: invitation.createdAt,
              acceptedAt: null,
              status: 'pending',
              invitedBy: invitation.invitedByUserId
            }))

          // Build map keyed by email; start with collaborators, then overlay pending invitations
          const byEmail: Record<string, any> = {}

          // Preserve actual collaborator status from server (accepted/pending/removed/rejected)
          for (const c of acceptedList) {
            if (!c?.email) continue
            byEmail[c.email] = {
              ...c,
              status: c.status ?? (c.acceptedAt ? 'accepted' : 'pending')
            }
          }

          // Overlay pending invitations so UI shows pending even if collaborator record exists
          ;(pendingCollaborators || []).forEach((p: any) => {
            byEmail[p.email] = { ...(byEmail[p.email] || {}), ...p, status: 'pending' }
          })

          // Only show accepted or pending entries in the UI
          const combinedList = Object.values(byEmail).filter((c: any) => 
            c.status === 'accepted' || c.status === 'pending'
          )

          setCollaborators(combinedList)
        } catch (error) {
          console.error('Failed to load collaborators:', error)
        } finally {
          setIsLoadingCollaborators(false)
        }
      }
    }

    if (isShareOpen) {
      loadCollaborators()
    }
  }, [isShareOpen, mindmapId])

  // Load mindmap on mount - try public API if regular load fails
  useEffect(() => {
    if (mindmapId) {
      const loadMindmapWithFallback = async () => {
        try {
          await loadMindmap(mindmapId)
        } catch (error: any) {
          // If load fails with 401/403, or browser extension blocks (code=403), try loading as public mindmap
          const isAuthDenied = error?.response?.status === 401 || error?.response?.status === 403
          const isExtensionBlocked = error?.code === 403 || error?.message === 'permission error'
          if (isAuthDenied || isExtensionBlocked) {
            try {
              // Chỉ thử tải mindmap công khai nếu URL có token
              const shareToken = searchParams.get('token')

              if (shareToken) {
                console.log('Loading public mindmap with token:', shareToken)
                const publicMindmap = await getPublicMindmap(shareToken)
                console.log('Successfully loaded public mindmap:', publicMindmap)
                // Enforce public access: block if private
                if (publicMindmap?.isPublic && publicMindmap?.publicAccessLevel !== 'private') {
                  const overlay = { ...publicMindmap, shareToken: publicMindmap.shareToken || shareToken }
                  setFullMindmapState(overlay)
                } else {
                  toast({
                    title: 'Access Denied',
                    description: 'Mindmap này đang ở chế độ riêng tư.',
                    variant: 'destructive',
                  })
                }
              } else {
                // Không có token công khai trong URL -> giữ nguyên trang editor và báo lỗi quyền truy cập
                console.warn('No shareToken in URL; skipping public fallback')
                toast({
                  title: "Access Denied",
                  description: "Bạn không có quyền truy cập mindmap này. Nếu công khai, hãy dùng liên kết chia sẻ công khai.",
                  variant: "destructive",
                })
              }
            } catch (publicError: any) {
              console.error('Failed to load public mindmap:', publicError)
              toast({
                title: "Error",
                description: publicError?.response?.data?.message || publicError?.message || "Không thể tải mindmap công khai.",
                variant: "destructive",
              })
            }
          } else {
            // Other errors (network, server error, etc.)
            console.error('Error loading mindmap:', error)
            toast({
              title: "Error",
              description: error?.response?.data?.message || error?.message || "Không thể tải mindmap.",
              variant: "destructive",
            })
          }
        }
      }
      loadMindmapWithFallback()
    }
  }, [mindmapId, loadMindmap, searchParams, toast, setFullMindmapState])

  const handleSave = async () => {
    try {
      await saveMindmap()
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save mindmap')
    }
  }

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

  const handleInvite = async (email: string, role: "EDITOR" | "VIEWER") => {
    if (!mindmapId) return;
    
    try {
      await inviteCollaborator(mindmapId, email, role)

      // Sau khi gửi lời mời thành công, làm mới danh sách một cách an toàn theo quyền owner
      const acceptedCollab = await getCollaborators(mindmapId)
      const acceptedList = toArray(acceptedCollab)

      // Chỉ owner mới được lấy pending invitations; bắt lỗi riêng để tránh hiển thị lỗi giả
      const isOwner = mindmap?.mysqlUserId === user?.userId
      let pendingInvitesRaw: any[] = []
      if (isOwner) {
        try {
          pendingInvitesRaw = await getPendingInvitations(mindmapId)
        } catch (e) {
          console.warn('Cannot load pending invitations (owner check)', e)
          pendingInvitesRaw = []
        }
      }
      const pendingInvites = toArray(pendingInvitesRaw)

      // Map pending invitations to collaborator format
      const pendingCollaborators = (pendingInvites || [])
        .filter((invitation: any) => invitation?.invitedEmail) // Filter out null emails
        .map((invitation: any) => ({
          email: invitation.invitedEmail,
          role: invitation.role,
          invitedAt: invitation.createdAt,
          acceptedAt: null,
          status: 'pending',
          invitedBy: invitation.invitedByUserId
        }))

      // Build map keyed by email; start with accepted, then overlay pending to ensure pending state wins
      const byEmail: Record<string, any> = {};
      for (const c of acceptedList) {
        if (!c?.email) continue
        byEmail[c.email] = {
          ...c,
          status: c.status ?? (c.acceptedAt ? 'accepted' : 'pending')
        }
      }

      (pendingCollaborators || []).forEach((p: any) => {
        byEmail[p.email] = { ...(byEmail[p.email] || {}), ...p, status: 'pending' }
      })

      const combinedList = Object.values(byEmail).filter((c: any) => 
        c.status === 'accepted' || c.status === 'pending'
      )

      setCollaborators(combinedList)
      
      // Toast thành công sẽ hiển thị ở ShareModal; không cần hiển thị thêm ở đây
    } catch (error: any) {
      console.error(error)
      const errorMsg = error.response?.data?.message || "Không thể gửi lời mời.";

      toast({
        variant: "destructive",
        title: "Gửi thất bại",
        description: errorMsg,
      })
      throw error;
    }
  }

  const handleUpdateRole = async (email: string, role: "EDITOR" | "VIEWER") => {
    if (!mindmapId) return;
    
    try {
      await updateCollaboratorRole(mindmapId, email, role)

      // Làm mới danh sách một cách an toàn theo quyền owner
      const acceptedCollab = await getCollaborators(mindmapId)
      const acceptedList = toArray(acceptedCollab)
      const isOwner = mindmap?.mysqlUserId === user?.userId
      let pendingInvitesRaw: any[] = []
      if (isOwner) {
        try {
          pendingInvitesRaw = await getPendingInvitations(mindmapId)
        } catch (e) {
          console.warn('Cannot load pending invitations (owner check)', e)
          pendingInvitesRaw = []
        }
      }
      const pendingInvites = toArray(pendingInvitesRaw)

      // Map pending invitations to collaborator format
      const pendingCollaborators = (pendingInvites || [])
        .filter((invitation: any) => invitation?.invitedEmail) // Filter out null emails
        .map((invitation: any) => ({
          email: invitation.invitedEmail,
          role: invitation.role,
          invitedAt: invitation.createdAt,
          acceptedAt: null,
          status: 'pending',
          invitedBy: invitation.invitedByUserId
        }))

      // Build map keyed by email; start with accepted, then overlay pending to ensure pending state wins
      const byEmail: Record<string, any> = {};
      for (const c of acceptedList) {
        if (!c?.email) continue
        byEmail[c.email] = {
          ...c,
          status: c.status ?? (c.acceptedAt ? 'accepted' : 'pending')
        }
      }

      (pendingCollaborators || []).forEach((p: any) => {
        byEmail[p.email] = { ...(byEmail[p.email] || {}), ...p, status: 'pending' }
      })

      const combinedList = Object.values(byEmail).filter((c: any) => 
        c.status === 'accepted' || c.status === 'pending'
      )

      setCollaborators(combinedList)
      
      // Không hiển thị toast ở đây để tránh trùng lặp; UI sẽ phản ánh thay đổi
    } catch (error: any) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật quyền",
      })
      throw error;
    }
  }

  const handleRemoveCollaborator = async (email: string) => {
    if (!mindmapId) return;
    
    try {
      await removeCollaborator(mindmapId, email)
      
      // Only owners can load pending invitations
      const isOwner = mindmap?.mysqlUserId === user?.userId
      let pendingInvitesRaw: any[] = []
      const acceptedCollab = await getCollaborators(mindmapId)
      const acceptedList = toArray(acceptedCollab)
      
      if (isOwner) {
        try {
          pendingInvitesRaw = await getPendingInvitations(mindmapId)
        } catch (error) {
          console.warn('Cannot load pending invitations (non-owner)', error)
          pendingInvitesRaw = []
        }
      }
      const pendingInvites = toArray(pendingInvitesRaw)

      // Map pending invitations to collaborator format
      const pendingCollaborators = (pendingInvites || [])
        .filter((invitation: any) => invitation?.invitedEmail) // Filter out null emails
        .map((invitation: any) => ({
          email: invitation.invitedEmail,
          role: invitation.role,
          invitedAt: invitation.createdAt,
          acceptedAt: null,
          status: 'pending',
          invitedBy: invitation.invitedByUserId
        }))

      // Build map keyed by email; start with accepted, then overlay pending to ensure pending state wins
      const byEmail: Record<string, any> = {};
      for (const c of acceptedList) {
        if (!c?.email) continue
        byEmail[c.email] = {
          ...c,
          status: c.status ?? (c.acceptedAt ? 'accepted' : 'pending')
        }
      }

      (pendingCollaborators || []).forEach((p: any) => {
        byEmail[p.email] = { ...(byEmail[p.email] || {}), ...p, status: 'pending' }
      })

      const combinedList = Object.values(byEmail)

      setCollaborators(combinedList)
    } catch (error: any) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể xóa collaborator",
      })
      throw error;
    }
  }

  const handleTogglePublic = async (isPublic: boolean, accessLevel?: "view" | "edit" | "private") => {
    if (!mindmapId) return;
    
    try {
      await updatePublicAccess(mindmapId, isPublic, accessLevel)
      // Fetch lại mindmap để lấy trạng thái mới và shareToken (nếu vừa công khai)
      const updated = await getMindmapById(mindmapId)
      setFullMindmapState(updated)

      // Giữ nguyên trang Editor và modal; chỉ cập nhật state để ShareModal hiển thị link công khai đúng
      
      toast({
        description: isPublic ? "Mindmap đã được công khai" : "Mindmap đã được chuyển thành riêng tư",
      })
    } catch (error: any) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái công khai",
      })
      throw error;
    }
  }

  if (!mindmap && mindmapId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Main Content - Full Screen */}
      <div className="flex-1 overflow-hidden relative">
        {/* Canvas Area */}
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 rounded-lg overflow-hidden">
            <Canvas readOnly={!(userRole === 'editor' || userRole === 'owner')} />
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

      {/* Floating Properties Panel - Outside relative container */}
      <PropertiesPanel canEdit={userRole === 'editor' || userRole === 'owner'} />
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      {isHistoryOpen && mindmap?.id && (
        <HistorySheet mindmapId={mindmap.id} mindmap={mindmap} onClose={() => setIsHistoryOpen(false)} />
      )}

      {/* Show PublicShareModal for non-owners, ShareModal for owners */}
      {user?.userId === mindmap?.mysqlUserId ? (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          onInvite={handleInvite}
          onUpdateRole={handleUpdateRole}
          onRemoveCollaborator={handleRemoveCollaborator}
          onTogglePublic={handleTogglePublic}
          mindmapTitle={mindmap?.title || "Untitled Mindmap"}
          collaborators={collaborators}
          isPublic={mindmap?.isPublic || false}
          publicAccessLevel={mindmap?.publicAccessLevel || "private"}
          isOwner={true}
          shareToken={mindmap?.shareToken}
          mindmapId={mindmapId || undefined}
        />
      ) : (
        <PublicShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          mindmapTitle={mindmap?.title || "Untitled Mindmap"}
          shareToken={mindmap?.shareToken}
          ownerName={mindmap?.ownerName}
          ownerAvatar={mindmap?.ownerAvatar}
          publicAccessLevel={mindmap?.publicAccessLevel || "private"}
        />
      )}
    </div>
  )
}

function EditorContent() {
  return (
    <ReactFlowProvider>
      <MindmapProvider>
        <EditorInner />
      </MindmapProvider>
    </ReactFlowProvider>
  )
}

export default function EditorPage() {
  // Allow access to editor page without auth if accessing public mindmap
  // The page will handle loading public mindmap if needed
  return (
    <ProtectedRoute requireAuth={false}>
      <EditorContent />
    </ProtectedRoute>
  )
}
