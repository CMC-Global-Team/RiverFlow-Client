"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import BackgroundCanvas from "@/components/mindmap/BackgroundCanvas"
import AiComposer from "@/components/ai/AiComposer"

function AiMindmapContent() {
  return (
    <div className="relative h-screen bg-background">
      <BackgroundCanvas />
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-6">
        <AiComposer />
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
