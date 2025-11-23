"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import BackgroundCanvas from "@/components/mindmap/BackgroundCanvas"
import ChatPanel from "@/components/ai/ChatPanel"

function AiMindmapContent() {
  return (
    <div className="relative h-screen bg-background">
      <BackgroundCanvas />
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-6">
        <ChatPanel />
      </div>
    </div>
  )
}

export default function AiMindmapPage() {
  return (
    <ProtectedRoute>
      <AiMindmapContent />
    </ProtectedRoute>
  )
}

