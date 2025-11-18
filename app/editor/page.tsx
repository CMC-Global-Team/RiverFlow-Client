"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Users, Loader2, Check, AlertCircle } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { MindmapProvider, useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import { ReactFlowProvider } from "reactflow"
import Toolbar from "@/components/editor/toolbar"
import Canvas from "@/components/editor/canvas"
import PropertiesPanel from "@/components/editor/properties-panel"
import BackButton from "@/components/editor/back-button"
import { useSearchParams } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import gsap from "gsap"
import { ThemeSwitcher } from "@/components/theme-switcher"
import ShareModal from "@/components/mindmap/ShareModal"
import { 
  inviteCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
  updatePublicAccess,
  getCollaborators
} from "@/services/mindmap/mindmap.service"
import { useToast } from "@/hooks/use-toast" 
function EditorInner() {
  const searchParams = useSearchParams()
  const mindmapId = searchParams.get('id')
  const titleRef = useRef<HTMLHeadingElement>(null)
  
  const {
    mindmap,
    saveMindmap,
    loadMindmap,
    isSaving,
    setTitle,
    autoSaveEnabled,
    setAutoSaveEnabled,
    saveStatus,
  } = useMindmapContext()
  
    const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [collaborators, setCollaborators] = useState([])
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(false)

  // Load collaborators when mindmap is loaded
  useEffect(() => {
    const loadCollaborators = async () => {
      if (mindmapId) {
        setIsLoadingCollaborators(true)
        try {
          const data = await getCollaborators(mindmapId)
          setCollaborators(data)
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

  // Load mindmap on mount
  useEffect(() => {
    if (mindmapId) {
      loadMindmap(mindmapId)
    }
  }, [mindmapId, loadMindmap])

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
      
      // Reload collaborators
      const data = await getCollaborators(mindmapId)
      setCollaborators(data)
      
      toast({
        title: "Đã gửi lời mời!",
        description: `Đã gửi email mời tới ${email}`,
      })
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
      
      // Reload collaborators
      const data = await getCollaborators(mindmapId)
      setCollaborators(data)
      
      toast({
        description: "Đã cập nhật quyền",
      })
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
      
      // Reload collaborators
      const data = await getCollaborators(mindmapId)
      setCollaborators(data)
      
      toast({
        description: `Đã xóa ${email}`,
      })
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
            <Canvas />
          </div>
        </div>

        {/* Floating Toolbar with Header Items */}
        <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none">
          <div className="pointer-events-auto">
            <Toolbar 
              mindmap={mindmap}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              titleRef={titleRef}
              handleTitleChange={handleTitleChange}
              handleTitleHover={handleTitleHover}
              handleTitleLeave={handleTitleLeave}
              autoSaveEnabled={autoSaveEnabled}
              setAutoSaveEnabled={setAutoSaveEnabled}
              isSaving={isSaving}
              saveStatus={saveStatus}
              handleSave={handleSave}
              onShareClick={() => setIsShareOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Floating Properties Panel - Outside relative container */}
      <PropertiesPanel />

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
      />
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
  return (
    <ProtectedRoute>
      <EditorContent />
    </ProtectedRoute>
  )
}
