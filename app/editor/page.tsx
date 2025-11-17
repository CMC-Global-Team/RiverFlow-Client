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
import { inviteCollaborator } from "@/services/mindmap/mindmap.service"
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

  if (!mindmap && mindmapId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton />
            <div 
              onClick={() => setIsEditing(true)} 
              className="cursor-pointer" 
              onBlur={() => setIsEditing(false)}
              onMouseEnter={handleTitleHover}
              onMouseLeave={handleTitleLeave}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={mindmap?.title || "Untitled Mindmap"}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  autoFocus
                  className="text-xl font-bold text-foreground bg-input border-2 border-primary rounded px-3 py-1"
                />
              ) : (
                <h1 
                  ref={titleRef}
                  className="text-xl font-bold text-foreground hover:text-primary transition-colors px-3 py-1 border-2 border-dashed border-muted-foreground/30 hover:border-primary rounded"
                >
                  {mindmap?.title || "Untitled Mindmap"}
                </h1>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
             <ThemeSwitcher/>
            {/* Auto-save Toggle */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background">
              <Switch
                id="auto-save"
                checked={autoSaveEnabled}
                onCheckedChange={setAutoSaveEnabled}
              />
              <Label htmlFor="auto-save" className="text-sm font-medium cursor-pointer">
                Auto-save
              </Label>
            </div>

            <button 
              onClick={() => setIsShareOpen(true)} // <-- THÊM SỰ KIỆN CLICK
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 hover:bg-muted transition-colors"
            >
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Share</span>
              <ChevronDown className="h-4 w-4" /> 
            </button>
            
            {!autoSaveEnabled && (
              <button 
                onClick={handleSave}
                disabled={isSaving || saveStatus === 'saved'}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
                {saveStatus === 'saved' && <Check className="h-4 w-4" />}
                {saveStatus === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
                <span>
                  {saveStatus === 'saving'
                    ? 'Saving...'
                    : saveStatus === 'saved'
                      ? 'Saved'
                      : saveStatus === 'error'
                        ? 'Retry Save'
                        : 'Save'}
                </span>
              </button>
            )}

            {/* Auto-save Status Indicator */}
            {autoSaveEnabled && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">Saved</span>
                  </>
                )}
                {saveStatus === 'error' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">Auto-save failed</span>
                  </>
                )}
                {saveStatus === 'idle' && (
                  <span>Auto-save enabled</span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 flex flex-col p-4">
          <div className="mb-4">
            <Toolbar />
          </div>
          <div className="flex-1 rounded-lg border border-border overflow-hidden">
            <Canvas />
          </div>
        </div>

        {/* Properties Panel */}
        <PropertiesPanel />
      </div>
      <ShareModal
         isOpen={isShareOpen}
         onClose={() => setIsShareOpen(false)}
         onInvite={handleInvite}
         mindmapTitle={mindmap?.title || "Untitled Mindmap"}
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
