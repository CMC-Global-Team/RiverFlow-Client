"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Users, Loader2, Check } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { MindmapProvider, useMindmapContext } from "@/contexts/mindmap/MindmapContext"
import Toolbar from "@/components/editor/toolbar"
import Canvas from "@/components/editor/canvas"
import PropertiesPanel from "@/components/editor/properties-panel"
import { useSearchParams } from "next/navigation"

function EditorInner() {
  const searchParams = useSearchParams()
  const mindmapId = searchParams.get('id')
  
  const {
    mindmap,
    saveMindmap,
    loadMindmap,
    isSaving,
    setTitle,
  } = useMindmapContext()
  
  const [isEditing, setIsEditing] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Load mindmap on mount
  useEffect(() => {
    if (mindmapId) {
      loadMindmap(mindmapId)
    }
  }, [mindmapId, loadMindmap])

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
            <div onClick={() => setIsEditing(true)} className="cursor-pointer" onBlur={() => setIsEditing(false)}>
              {isEditing ? (
                <input
                  type="text"
                  value={mindmap?.title || "Untitled Mindmap"}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  autoFocus
                  className="text-xl font-bold text-foreground bg-input border border-border rounded px-2 py-1"
                />
              ) : (
                <h1 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                  {mindmap?.title || "Untitled Mindmap"}
                </h1>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 hover:bg-muted transition-colors">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Share</span>
              <ChevronDown className="h-4 w-4" />
            </button>
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
    <MindmapProvider>
      <EditorInner />
    </MindmapProvider>
  )
}

export default function EditorPage() {
  return (
    <ProtectedRoute>
      <EditorContent />
    </ProtectedRoute>
  )
}
