"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Users, Loader2, Check } from "lucide-react"
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
    nodes,
    edges,
  } = useMindmapContext()
  
  const [isEditing, setIsEditing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [autoSave, setAutoSave] = useState(true)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoadRef = useRef(true)

  // Load mindmap on mount
  useEffect(() => {
    if (mindmapId) {
      loadMindmap(mindmapId)
    }
  }, [mindmapId, loadMindmap])

  // Auto-save when nodes or edges change
  useEffect(() => {
    // Skip auto-save on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      return
    }

    // Skip if auto-save is disabled
    if (!autoSave) return

    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new timeout for auto-save (debounce 2 seconds)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaveStatus('saving')
        await saveMindmap()
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (error) {
        console.error('Auto-save failed:', error)
        setSaveStatus('idle')
      }
    }, 2000)

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [nodes, edges, autoSave, saveMindmap])

  const handleSave = async () => {
    try {
      setSaveStatus('saving')
      await saveMindmap()
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Save failed:', error)
      setSaveStatus('idle')
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
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
              <Label htmlFor="auto-save" className="text-sm font-medium cursor-pointer">
                Auto-save
              </Label>
            </div>

            <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 hover:bg-muted transition-colors">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Share</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {!autoSave && (
              <button 
                onClick={handleSave}
                disabled={isSaving || saveStatus === 'saved'}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveStatus === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
                {saveStatus === 'saved' && <Check className="h-4 w-4" />}
                <span>
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}
                </span>
              </button>
            )}

            {/* Auto-save Status Indicator */}
            {autoSave && (
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
