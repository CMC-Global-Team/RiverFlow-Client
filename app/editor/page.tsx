"use client"

import { useState } from "react"
import { ChevronDown, Users } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import Toolbar from "@/components/editor/toolbar"
import Canvas from "@/components/editor/canvas"
import PropertiesPanel from "@/components/editor/properties-panel"

function EditorContent() {
  const [mindmapTitle, setMindmapTitle] = useState("Untitled Mindmap")
  const [isEditing, setIsEditing] = useState(false)

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
                  value={mindmapTitle}
                  onChange={(e) => setMindmapTitle(e.target.value)}
                  autoFocus
                  className="text-xl font-bold text-foreground bg-input border border-border rounded px-2 py-1"
                />
              ) : (
                <h1 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                  {mindmapTitle}
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
            <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground font-medium hover:bg-primary/90 transition-all">
              Save
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

export default function EditorPage() {
  return (
    <ProtectedRoute>
      <EditorContent />
    </ProtectedRoute>
  )
}
